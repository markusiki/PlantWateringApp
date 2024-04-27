This project is for controlling and monitoring an automatic plant watering process, run by Raspberry Pi.

This project consists of React/TypeScript frontend, and Pyhton/Flask backend.

The app has a login page for user authentication. The authentication has been implemented by flask jwt, json webtoken 

The app consists of the following main functionalities:
1. Water Now - Manually water each plant.
2. Logs - Check the watering logs.
3. Unit settings - Settings for plant name, moisture level limit, enable automatic watering by moisture level and max watering interval.
4. Device settings - Settings for soil measure interval and enable automatic watering.
