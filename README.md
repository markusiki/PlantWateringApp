# Plant Watering App

This project is for controlling and monitoring an automatic plant watering process, run by Raspberry Pi.

This project consists of a React/TypeScript frontend and a Python/Flask backend.

## Table of Contents

- [Features](#features)
- [Hardware](#hardware)
- [Installation](#installation)
- [Local Usage](#local-usage)

## Features

The app has a login page for user authentication. The authentication has been implemented by flask jwt (json webtoken).

The app consists of the following main functionalities:

1. Water Now - Manually water each plant.
2. Logs - Check the watering logs.
3. Unit settings - Settings for plant name, moisture level limit, watering time, enable and set automatic min watering interval by moisture level, enable and set automatic max watering interval by moisture level.
4. Device settings - Settings for soil measure interval and to enable automatic watering.

## Hardware

To set up the Plant Watering hardware, you will need the following hardware components:

1. **Raspberry Pi** (any model with GPIO pins, Zero W used in the development)
2. **4 Capasitive Soil Moisture Sensors**
3. **1 Water Pump** (12v)
4. **Relay Module** (minimum 5 relays)
5. **4 Water Valves** (one for each plant)
6. **Jumper Wires** (to connect the components, Female-Female)
7. **Power Supply** (12v min 2A)
8. **DC-DC 12v-5v Step-Down Regulator** (to step down voltage for the sensors and other components, 12v to 5v)
9. **16 Bit I2C ADS1115 Module** (for moisture sensor analog-to-digital signal conversion)

## Installation

### Backend (on the Raspberry Pi)

1. Clone the repository:

   ```sh
   git clone https://github.com/markusiki/PlantWateringApp.git
   cd PlantWateringApp/backend
   ```

2. Create a virtual environment and activate it:

   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install the dependencies:

   ```sh
   pip install -r reqs.txt
   ```

4. Create user account:

   ```sh
   python createUser.py
   ```

5. Run the backend server:
   ```sh
   flask run --host=0.0.0.0
   ```

### Frontend

1. Navigate to the frontend directory:

   ```sh
   cd ../frontend
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

3. Run the frontend server:
   ```sh
   npm start
   ```

## Local Usage

1. Open http://localhost:3000 in your browser.
2. Log in using your credentials.
3. Use the navigation menu to access different functionalities like watering plants, checking logs, and updating settings.

Home page view:
![image](https://github.com/markusiki/PlantWateringApp/assets/110092345/c86a7ca4-dcef-4b7b-8042-5cf24921d38d)
