import urllib.request
import json

payload = {"query": "top 5 customer from mumbai who spents on shoes"}
req = urllib.request.Request("http://127.0.0.1:8000/api/segments/ai-build", data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
try:
    with urllib.request.urlopen(req) as response:
        print(json.dumps(json.loads(response.read()), indent=2))
except Exception as e:
    print(e)
