vcmp-livemap
============

Web-based Live Map for Vice City Multiplayer

The map uses the ``data.json`` file in its web directory, which you have to update from the server, by default every 5 seconds.

Example for ``data.json``:
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
                "x": -672.98,
                "z": 11.2629
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
                "x": -672.98,
                "z": 11.2629
            },
            "spectating": 0
        }
    ],
    "messages": [
        {
            "name": "Player name",
            "team": 255,
            "country": "Country name",
            "type": 1
        },
        {
            "name": "Player name",
            "team": 13,
            "reason": 0,
            "type": 2
        },
        {
            "name": "Player name",
            "team": 13,
            "skin": 1,
            "type": 3
        },
        {
            "name": "Player name",
            "team": 255,
            "msg": "te ves lentisimo",
            "type": 4
        }
    ]
}
````
