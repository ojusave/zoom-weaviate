

import os
import weaviate
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/')
def info():
    return 'This is an API Server to store and query for vector embeddings from Weaviate!'


@app.route('/input', methods=['POST'])
def receive_data():
    
    content_type = request.headers.get('Content-Type')
    if (content_type == 'application/json'):

        client = weaviate.connect_to_wcs(
            cluster_url=os.getenv("WCS_URL"),
            auth_credentials=weaviate.auth.AuthApiKey(os.getenv("WCS_API_KEY")),
            headers={
                "X-OpenAI-Api-Key": os.environ["OPENAI_APIKEY"]  # Replace with your inference API key
            }
        )

        try:
            ZoomWorkplaceData = client.collections.get("ZoomWorkplaceData")
            uuid = ZoomWorkplaceData.data.insert(request.json)

        finally:
            client.close()  # Close client gracefully
        print(uuid)
        return jsonify(uuid), 200

    else:
        return 'Content-Type not supported!'


@app.route('/query', methods=['POST'])
def query_data(): 
    user_query = request.json.get('message')


    content_type = request.headers.get('Content-Type')
    if (content_type == 'application/json'):

        client = weaviate.connect_to_wcs(
            cluster_url=os.getenv("WCS_URL"),
            auth_credentials=weaviate.auth.AuthApiKey(os.getenv("WCS_API_KEY")),
            headers={
                "X-OpenAI-Api-Key": os.environ["OPENAI_APIKEY"]  # Replace with your inference API key
            }
        )

        try:
            ZoomWorkplaceData = client.collections.get("ZoomWorkplaceData")
            response = ZoomWorkplaceData.generate.hybrid(query=user_query,
                limit=4,
                grouped_task=f"You are a helpful AI Assistant. Be brief in your responses. Write a reply to a chat message in reply to the following data. Here's the user's message {request.json.get('message')}",)

        finally:
            client.close()  # Close client gracefully
        
        return jsonify({"response": response.generated}), 200

    else:
        return 'Content-Type not supported!'
