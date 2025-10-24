# load the allrequests.json

import json
import requests
import os, time
from dotenv import load_dotenv  


with open('AllRequests.json') as f:
    requests_data = json.load(f)    
    # sort by ID
    requests_data = sorted(requests_data, key=lambda x: x['id'])
    print(f"Total requests to process: {len(requests_data)}")
    for request in requests_data:
        print(f"Request ID: {request['id']}, Name: {request['name']}")
        # set the url replace full domain e.g https://ca-imptre-prod-uksouth.victoriousbeach-f9aacb22.uksouth.azurecontainerapps.io with https://PLACEHOLDER using the first / as split
        url_parts = request['url'].split('/', 3)
        if len(url_parts) > 3:
            request['url'] = 'https://PLACEHOLDER/' + url_parts[3]
        else:
            request['url'] = 'https://PLACEHOLDER/'
        # print the modified url
        print(f"Modified URL: {request['url']}")
        # Replace X-API-Key with PLACEHOLDER
        if 'headers' in request:
            for header in request['headers']:
                if header['key'] == 'X-API-Key':
                    header['value'] = 'PLACEHOLDER'
        # print the modified headers
        print("Modified Headers:")

# write back to AllRequests.json
with open('AllRequests.json', 'w') as f:
    json.dump(requests_data, f, indent=4)