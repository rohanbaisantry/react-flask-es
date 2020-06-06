import json
import traceback

from flask import Flask, request, render_template, jsonify
from elasticsearch import Elasticsearch
from flask_cors import CORS

from util_functions import get_data_to_insert_from_request, get_query, get_retval
from util_functions import get_pagination_counts, MAX_PER_PAGE


app = Flask(__name__)
es = Elasticsearch(host="0.0.0.0")

CORS(app, resources={r"*": {"origins": "*"}}, supports_credentials=True)

default_res_from_es = {
    "hits": {
        "hits": [],
        "total": {
            "value": 0,
            "relation": "eq"
        }
    }
}


@app.route('/list_items', methods=['GET'])
def list_items():
    body = {
        "query": {
            "match_all": {}
        },
        "size": MAX_PER_PAGE,
        "from": 0
    }
    try:
        res = es.search(index="contents", doc_type="title", body=body)
    except Exception as e:
        app.logger.info('ERROR', e)
        res = default_res_from_es
    retval = get_retval(res)
    return jsonify(retval)


@app.route('/insert_data', methods=['POST', 'PUT'])
def insert_data():
    body = get_data_to_insert_from_request(request)
    if request.method == 'POST':
        result = es.index(index='contents', doc_type='title', body=body)
        body["id"] = result['_id']
        item = [body]
        try:
            res = es.search(index="contents", doc_type="title")
        except Exception as e:
            app.logger.info('ERROR', e)
            res = default_res_from_es
        count = res['hits']['total']
        pagination_counts = get_pagination_counts(count)
        retval = {
            "item": item,
            "pagination_counts": pagination_counts
        }
        return jsonify(retval)
    else:
        id = body.pop("id")
        es.update(index='contents', doc_type='title', id=id, body=dict(doc=body))
        body["id"] = id
        retval = [body]
        return jsonify(retval)


@app.route('/delete_data', methods=['DELETE'])
def delete_data():
    data = json.loads(request.data.decode("utf-8"))
    _id = data['id']
    es.delete(index='contents', doc_type='title', id=_id)
    return jsonify(dict(success=True))


@app.route('/search', methods=['GET'])
def search():
    keyword = request.args.get('keyword', '')
    page = int(request.args.get('page', 1))
    body = get_query(keyword, page)
    try:
        res = es.search(index="contents", doc_type="title", body=body)
    except Exception as e:
        app.logger.info('ERROR', e)
        res = default_res_from_es
    retval = get_retval(res)
    return jsonify(retval)


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001, debug=True)

