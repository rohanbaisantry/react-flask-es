Steps to run the Project:


(1) To Build the Docker for the flask server:
```
In the "qrayquest-server" folder:
-> docker build --tag qrayquest-server .
```

(2) To Build the docker for the react app:
```
In the "grayquest-client" folder:
-> npm run-script build
-> docker build . -t grayquest-client
```

(3) start the docker
```
In the "grayquest" folder:
-> docker-compose build && docker-compose up
```

(4) create ES index
```
Note: This step has to be done only when you are performing up for the first time or if 
the data has been deleted  or the containers have been removed.
I chose Elastic search as the DB just so that the searching is more optimised.

Once the dockers are running:
-> docker exec -it grayquest-server /bin/sh
-> python3

*inside the terminal*
    from __init__ import resetdb
    resetdb()
    exit()
```

(7) To view the Output goto "http://localhost:8000/" in your browser.



Some points to note:
```
(1)
In case you are running into connection issues with elastic search from within the docker:
Open a terminal and type in "docker network inspect bridge | grep Gateway"
Copy this ip and use that as the host instead of what is in the code and check.

(2)
In case there are nginX issues, just delete the "nginx.conf" file and remove line 2 from "Dockerfile"
in the "grayquest-client" folder. 

(3)
Any changes to the files and you will have to redo the entire process to have the changes 
reflected.
```