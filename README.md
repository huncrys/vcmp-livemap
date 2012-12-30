Live Map for Vice City Multiplayer
============

The map uses the ``data.json`` file in its web directory, which you have to update from the server, by default every 5 seconds.

You can use online services that can parse or validate your JSON data if it is correct. You can find them at the following URLs:
* http://jsonlint.com
* http://json.parser.online.fr

__Usage examples__:
* http://cheese.crys.hu/livemap - always the latest version
* http://ea.vrocker-hosting.co.uk/livemap

__Example for ``data.json``:__
````json
{
    "hostname": "Server name",
    "weather": 4,
    "hour": 10,
    "minute": 30,
    "numplayers": 2,
    "maxplayers": 2,
    "players": [
        {
            "id": 0,
            "name": "Player name",
            "skin": 30,
            "team": 8,
            "hp": 3,
            "ap": 0,
            "score": 6,
            "cash": 0,
            "ping": 83,
            "weapon": 0,
            "vehicle": null,
            "pos": {
                "y": 941.733,
                "x": -672.98
            },
            "spectating": null
        },
        {
            "id": 1,
            "name": "Player name",
            "skin": 35,
            "team": 8,
            "hp": 3,
            "ap": 100,
            "score": 6,
            "cash": 1123,
            "ping": 83,
            "weapon": 12,
            "vehicle": {
                "model": 230,
                "color": [10, 21],
                "health": 1000
            },
            "pos": {
                "y": 941.733,
                "x": -672.98
            },
            "spectating": 0
        }
    ],
    "messages": [
        // join
        {
            "name": "Player name",
            "team": 255,
            "country": "Country name",
            "type": 1
        },
        // part
        {
            "name": "Player name",
            "team": 13,
            "reason": 0,
            "type": 2
        },
        // spawn
        {
            "name": "Player name",
            "team": 13,
            "skin": 1,
            "type": 3
        },
        // chat
        {
            "name": "Player name",
            "team": 255,
            "msg": "Message text",
            "type": 4
        },
        // action
        {
            "name": "Player name",
            "team": 255,
            "msg": "Action text",
            "type": 5
        },
        // death
        {
            "name": "Player name",
            "team": 255,
            "reason": 43,
            "type": 6
        },
        // kill
        {
            "name": "Killer name",
            "team": 255,
            "victim": "Victim name",
            "vteam": 13,
            "reason": 15,
            "bodypart": 2,
            "type": 7
        },
        // teamkill
        {
            "name": "Killer name",
            "team": 13,
            "victim": "Victim name",
            "vteam": 13,
            "reason": 15,
            "bodypart": 2,
            "type": 8
        },
        // teamchat
        {
            "name": "Player name",
            "team": 255,
            "msg": "Message text",
            "type": 9
        }
    ]
}
````
