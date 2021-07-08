# Copyright 2018 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# [START gae_python38_app]
# [START gae_python3_app]
from flask import Flask,send_from_directory,request,json
import requests
from geolib import geohash
import time

# If `entrypoint` is not defined in app.yaml, App Engine will look for an app
# called `app` in `main.py`.
app = Flask(__name__)

@app.route("/get-report")
def get_report():
    return send_from_directory('static',"EventSearch.html")

@app.route('/abc')
def abc():
    
    if request.args['button_type'] == 'here':
        location_coords = request.args['location'].split(',')
        g_hash = geohash.encode(location_coords[0], location_coords[1], 7)
       
    elif request.args['button_type'] == 'loc':
        loc_details = request.args['location'].replace(' ','+')
        # searchloc = requests.get("https://maps.googleapis.com/maps/api/geocode/json?address="+request.args['location']+"&key=AIzaSyA144ETcnXTpwaW6hNt3jDRbG8E659IPTQ")
        searchloc = requests.get("https://maps.googleapis.com/maps/api/geocode/json?address="+loc_details+"&key=AIzaSyA144ETcnXTpwaW6hNt3jDRbG8E659IPTQ")
        co_ords = searchloc.json()['results'][0]['geometry']['location']
        g_hash = geohash.encode(co_ords['lat'], co_ords['lng'], 7)

    segment = request.args['segment']
    distance = request.args['distance']

    segment_match = {'music':'KZFzniwnSyZfZ7v7nJ','sports':'KZFzniwnSyZfZ7v7nE','arts':'KZFzniwnSyZfZ7v7na','film':'KZFzniwnSyZfZ7v7nn','miscellaneous':'KZFzniwnSyZfZ7v7n1'}
    if segment == "default":
        search_ticket = requests.get("https://app.ticketmaster.com/discovery/v2/events.json?apikey=X6u9EWgGffYrWEcBL4NUJRYfH39R4A78&keyword="+request.args['key']+"&radius="+distance+"&unit=miles&geoPoint="+g_hash)
    else:
        segment_id = segment_match[segment]
        search_ticket = requests.get("https://app.ticketmaster.com/discovery/v2/events.json?apikey=X6u9EWgGffYrWEcBL4NUJRYfH39R4A78&keyword="+request.args['key']+"&segmentId="+segment_id+"&radius="+distance+"&unit=miles&geoPoint="+g_hash)

    try:
        events_list = search_ticket.json()['_embedded']['events']
        res_dictionary = []
        for i in range(len(events_list)):
            res_dict={}
            try:
                res_dict["dates"] = events_list[i]['dates']['start']['localDate']+" "+events_list[i]['dates']['start']['localTime']
            except:
                res_dict["dates"] = ""
            try:
                res_dict["logo"] = events_list[i]['images'][0]['url']
            except:
                res_dict["logo"] = ""
            try:
                res_dict["event_name"] = events_list[i]['name']
            except:
                res_dict["event_name"] = ""
            try:
                res_dict["url"] = events_list[i]['url']
            except:
                res_dict["url"] = ""
            try:
                res_dict["id"] = events_list[i]['id']
            except:
                res_dict["id"] = ""
            try:
                res_dict["genre"] = events_list[i]['classifications'][0]['segment']['name']
            except:
                res_dict["genre"] = ""
            try:
                res_dict["venue"] = events_list[i]['_embedded']['venues'][0]['name']
            except:
                res_dict["venue"] = ""

            res_dictionary.append(res_dict)  
        return json.dumps({'success':True,'data':res_dictionary}),200,{'ContentType':'application/json'}

    except Exception as e:
        return json.dumps({'success':False,'data':[{}]}),200,{'ContentType':'application/json'}

@app.route('/eventdetails')
def eventdetails():

    event_details = requests.get("https://app.ticketmaster.com/discovery/v2/events/"+request.args['event_id']+".json?apikey=X6u9EWgGffYrWEcBL4NUJRYfH39R4A78&")
    event_result = event_details.json()
    event_dict ={}
    try:
        event_dict["event_name"] = event_result['name']
    except:
        event_dict["event_name"] = ""
    try:
        event_dict["dates"] = event_result['dates']['start']['localDate']+" "+event_result['dates']['start']['localTime']
    except:
        event_dict["dates"] = ""
    try:
        artist =[]
        
        for i in range(len(event_result['_embedded']['attractions'])): 
           artist.append(event_result['_embedded']['attractions'][i]['name'])

        event_dict["artist"] = artist

    except:
           event_dict["artist"] = ""

    try:
        artistURL = []
        for i in range(len(event_result['_embedded']['attractions'])):
            artistURL.append(event_result['_embedded']['attractions'][i]['url'])

        event_dict["artistURL"] = artistURL
        
    except:
        event_dict["artistURL"] = ""
        
    try:
        event_dict["venue"] = event_result['_embedded']['venues'][0]['name']
    except:
        event_dict["venue"] = ""
    try: 
        event_dict["genre"] = ""
        if event_result['classifications'][0]['subGenre']['name'] != 'Undefined':
            event_dict["genre"] += event_result['classifications'][0]['subGenre']['name'] + " | "
        if event_result['classifications'][0]['genre']['name'] != 'Undefined':
            event_dict["genre"] += event_result['classifications'][0]['genre']['name'] + " | "
        if event_result['classifications'][0]['segment']['name'] != 'Undefined':
            event_dict["genre"] += event_result['classifications'][0]['segment']['name'] + " | "
        if event_result['classifications'][0]['subType']['name'] != 'Undefined':
            event_dict["genre"] += event_result['classifications'][0]['subType']['name'] + " | "
        if event_result['classifications'][0]['type']['name'] != 'Undefined':
            event_dict["genre"] += event_result['classifications'][0]['type']['name']
    except:
        pass
    event_dict["genre"] = event_dict["genre"].rstrip()
    if event_dict["genre"][-1] == '|':
        len_gen = len(event_dict["genre"])
        event_dict["genre"] = event_dict["genre"][0:len_gen-1]
    try:
        event_dict["price"] = str(event_result['priceRanges'][0]['min'])+" - "+str(event_result['priceRanges'][0]['max'])+" USD"
    except:
        event_dict["price"] = ""
    try:
        event_dict["status"] = event_result['dates']['status']['code']
    except:
        event_dict["status"] = ""
    try:        
        event_dict["buy"] = event_result['url']
    except:
        event_dict["buy"] = ""
    try:       
        event_dict["seatmap"] = event_result['seatmap']['staticUrl']
    except:
        event_dict["seatmap"] = ""
    return json.dumps({'success':True,'data':event_dict}),200,{'ContentType':'application/json'}   

if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    app.run(host='127.0.0.1', port=8080, debug=True)
# [END gae_python3_app]
# [END gae_python38_app]
