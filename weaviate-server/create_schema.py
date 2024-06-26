import os
import requests
import weaviate
import weaviate.classes as wvc

client = weaviate.connect_to_wcs(
    cluster_url=os.getenv("WCS_URL"),
    auth_credentials=weaviate.auth.AuthApiKey(os.getenv("WCS_API_KEY")),
    headers={
        "X-OpenAI-Api-Key": os.environ["OPENAI_APIKEY"]  # Replace with your inference API key
    }
)

client.collections.delete("ZoomWorkplaceData")

ZoomWorkplaceData = client.collections.create(
    name="ZoomWorkplaceData",
    vectorizer_config=wvc.config.Configure.Vectorizer.text2vec_openai(model="text-embedding-3-small"),
    generative_config=wvc.config.Configure.Generative.openai(model="gpt-4")
)

client.close()