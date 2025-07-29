# Plant Watering App

This project is for controlling and monitoring an automatic plant watering process, run by Raspberry Pi. It aims to help users maintain optimal soil moisture levels for their plants by automating the watering process. The system uses soil moisture sensors to monitor the moisture levels and a water pump and solenoid valves to deliver water to the plants as needed.

The project consists of a React/TypeScript frontend, a Python/Flask backend, and a Node.js BFF (Backend for Frontend) layer. The frontend provides a user-friendly interface for monitoring and controlling the watering system, while the backend handles the logic for reading sensor data, controlling the water pump and solenoid valves, and managing user authentication. The BFF layer serves as an intermediary that handles authentication tokens, user management, and provides a secure proxy to the IoT devices.

The system supports different watering methods:
- **Manual Watering**: Users can manually trigger watering for each plant.
- **Automatic Watering by Moisture Level**: The system automatically waters the plants when the soil moisture level drops below a specified limit.
- **Automatic Watering by Interval**: The system can be configured to water the plants at regular intervals, regardless of the soil moisture level.

The system supports up to 4 solenoid valves, but the water flow can be divided to various plants, allowing for flexible watering configurations.

## Table of Contents

- [Features](#features)
- [Hardware](#hardware)
- [Installation](#installation)
- [Local Usage](#local-usage)

## Features

The app has a login page for user authentication. The authentication has been implemented by flask jwt (json webtoken).

The app consists of the following main functionalities:

1. **Water Now** - Manually water each plant with real-time countdown timer.
2. **Logs** - Check the watering logs with detailed information including date, status, moisture value, and watering method.
3. **Unit Settings** - Comprehensive settings for each plant unit:
   - Plant name customization
   - Moisture level limit configuration
   - Watering time (0-600 seconds)
   - Water flow rate settings (l/s)
   - Enable/disable automatic watering
   - Automatic min/max watering intervals by moisture level
   - Sensor calibration (wet and dry calibration points)
4. **Device Settings** - Global device configuration:
   - Soil moisture measurement interval (1-30 days)
   - Number of active units (1-4)
   - Time program enable/disable
   - Water tank volume and current water amount monitoring
5. **Water Tank Management** - Real-time monitoring of water tank levels with visual indicators.
6. **Sensor Calibration** - Advanced moisture sensor calibration system for accurate readings.
7. **Device Power Management** - Remote device shutdown capability.
8. **Real-time Status Monitoring** - Live connection status and sensor readings.

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
![image](https://github.com/user-attachments/assets/8c6807a9-4efe-4c08-a5e3-c6095f0aa616)

