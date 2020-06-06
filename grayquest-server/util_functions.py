import json

import requests
from bs4 import BeautifulSoup

MAX_PER_PAGE = 10


def get_og_data(url):
    try:
        web_page = requests.get(url).content
        soup = BeautifulSoup(web_page, "html.parser")
        desc = soup.find("meta", property="og:description")
        title = soup.find("meta", property="og:title")
        image = soup.find("meta", property="og:image")
    except Exception:
        title = image = desc = None
    title = title["content"] if title else "No meta title given"
    image = image["content"] if image else "null"
    desc = desc["content"] if desc else "No meta description given"
    return title, image, desc


def get_websites_to_scrape(main_url, limit):
    web_page = requests.get(main_url).content
    soup = BeautifulSoup(web_page, "html.parser")
    a_tags = soup.find_all('a', href=True)
    a_tags_to_search_from = list(filter(lambda a: a.get("rel") == ["noopener"], a_tags))
    if len(a_tags_to_search_from) >= limit:
        a_tags_to_search_from = a_tags_to_search_from[:limit]
    web_sites_to_scrape = ["https:%s" % a['href'] for a in a_tags_to_search_from]
    return web_sites_to_scrape


def get_data_to_insert_from_request(request):
    data = json.loads(request.data.decode("utf-8"))
    main_url = data['main_url']
    limit = int(data['limit'])
    scraped_data = list()
    web_sites_to_scrape = get_websites_to_scrape(main_url, limit)
    for web_page in web_sites_to_scrape:
        og_title, og_image, og_desc = get_og_data(web_page)
        scraped_data.append(dict(
            og_title=og_title,
            og_description=og_desc,
            og_image=og_image,
            web_page=web_page
        ))

    body = dict(
        name=data['name'],
        limit=limit,
        main_url=main_url,
        scraped_data=scraped_data
    )
    if "id" in data:
        body['id'] = data["id"]
    return body


def get_query(keyword, page):
    max_per_page, offset = 10, 0
    offset = max_per_page * int(page-1)
    keyword = keyword or ''
    query = "*%s*" % keyword
    body = {
        "query": {
            "bool": {
                "should": [
                    {
                        "query_string": {
                            "query": query,
                            "fields": ["name"],
                            "fuzziness": "AUTO"
                        }
                    },
                    {
                        "query_string": {
                            "query": query,
                            "fields": ["main_url"],
                            "fuzziness": "AUTO"
                        }
                    }
                ]
            }
        },
        "size": max_per_page,
        "from": offset
    }
    return body


def get_pagination_counts(count, max_size_per_page=MAX_PER_PAGE):
    max_pages = int(count / max_size_per_page)
    if count % max_size_per_page or not count:
        pages_to_add = 2
    else:
        pages_to_add = 1
    max_pages += pages_to_add
    pagination_counts = list(range(1, max_pages))
    return pagination_counts


def get_retval(res):
    items = res['hits']['hits']
    count = res['hits']['total']
    pagination_counts = get_pagination_counts(count)
    retval = {
        "pagination_counts": pagination_counts
    }
    item_retval = []
    for item in items:
        body = item["_source"]
        body["id"] = item["_id"]
        item_retval.append(body)
    retval["items"] = item_retval
    return retval
