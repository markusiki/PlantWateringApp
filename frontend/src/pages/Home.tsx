import {
  IonApp,
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonRouterOutlet,
  RefresherEventDetail,
  useIonRouter,
  useIonToast,
} from '@ionic/react'
import './Home.css'
import React, { useEffect, useRef, useState } from 'react'
import { IUnitState, IDeviceSettingsState, IUnitSettingsState, IUnitToUpdate } from '../interfaces'
import serviceHelper from '../services/helpers'
import userService from '../services/user'
import unitService from '../services/units'
import deviceService from '../services/device'
import Login from './Login'
import Menu from '../components/Menu'
import Unit from '../components/Unit'
import Header from '../components/Header'
import { Redirect, Route, Switch } from 'react-router-dom'

const Home: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginSpinner, setLoginSpinner] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [units, setUnits] = useState<IUnitState[]>([])
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false)
  const [deviceSettings, setDeviceSettings] = useState<IDeviceSettingsState>({
    runTimeProgram: false,
    moistMeasureInterval: 1,
    numberOfUnits: 4,
    tankVolume: 0,
    waterAmount: 0,
  })
  const refresherRef = useRef<NodeJS.Timeout>()

  const [waterNowDisabeled, setWaterNowDisabled] = useState(false)

  const [present] = useIonToast()
  const router = useIonRouter()

  const toast = (message: string, duration: number = 5000) => {
    present({
      message: message,
      duration: duration,
      position: 'middle',
    })
  }

  useEffect(() => {
    const initialize = async () => {
      await refresh()
      setIsInitialized(true)
    }
    initialize()
  }, [isLoggedIn])

  useEffect(() => {
    const loggedUser = window.localStorage.getItem('user')
    if (loggedUser) {
      serviceHelper.setUser(loggedUser)
    }
  }, [])

  useEffect(() => {
    const setRefresher = () => {
      refresherRef.current = setInterval(refresh, 10000)
    }
    clearInterval(refresherRef.current)
    if (isLoggedIn) {
      setRefresher()
    }
  }, [isLoggedIn])

  const deauthorize = () => {
    setUnits([])
    setIsLoggedIn(false)
    window.localStorage.removeItem('user')
  }

  const handleLogin = async (event: React.MouseEvent) => {
    event.preventDefault()
    const loginSpinnerTimeout = setTimeout(() => {
      setLoginSpinner(true)
    }, 3000)
    try {
      const response = await userService.login({ username, password })
      if (response?.status === 200 && response.headers['content-type'] === 'application/json') {
        window.localStorage.setItem('user', username)
        serviceHelper.setUser(username)
        setUsername('')
        setPassword('')
        setIsLoggedIn(true)
        router.push('/')
      } else {
        toast('The device is offline. Please make sure that the device is turned on and connected to WiFi.', 8000)
      }
    } catch (error: any) {
      if (error.status === 502) {
        toast('Service unavailable. Please contact the admin.')
      } else if (error.status === 503) {
        toast('Wormhole is closed. Please contact the admin.')
      } else {
        toast(error.response.data.message, 1500)
      }
    } finally {
      clearTimeout(loginSpinnerTimeout)
      setLoginSpinner(false)
    }
  }

  const handleLogout = async (event: React.MouseEvent) => {
    event.preventDefault()
    try {
      const response = await userService.logout()
      toast(response.data.message, 1500)
    } catch (error) {
    } finally {
      deauthorize()
    }
  }

  const handleShutdown = async () => {
    try {
      const response = await deviceService.shutdown()
    } catch (error: any) {}
  }

  const fetchDeviceSettings = async () => {
    try {
      const deviceResponse = await deviceService.getAll()
      if (deviceResponse?.status === 200 && deviceResponse.headers['content-type'] === 'application/json') {
        setIsBackendConnected(true)
        setDeviceSettings(deviceResponse.data)
        setIsLoggedIn(true)
      }
    } catch (error: any) {
      const status = error?.response.status
      setIsBackendConnected(false)
      if (status === 401 || status === 422) {
        deauthorize()
      }
    }
  }

  const fetchUnits = async () => {
    try {
      const unitsResponse = await unitService.getAll()
      if (unitsResponse?.status === 200 && unitsResponse.headers['content-type'] === 'application/json') {
        setIsBackendConnected(true)
        setUnits(unitsResponse.data)
      }
    } catch (error: any) {
      const status = error?.response.status
      setIsBackendConnected(false)
      if (status === 401 || status === 422) {
        deauthorize()
      }
    }
  }

  const refresh = async () => {
    await Promise.all([fetchDeviceSettings(), fetchUnits()])
  }

  const handleRefresh = (event: CustomEvent<RefresherEventDetail>) => {
    setTimeout(() => {
      refresh()
      event.detail.complete()
    }, 1000)
  }

  const deleteLogs = async (event: React.MouseEvent, id: string) => {
    event.preventDefault()
    try {
      const returnedUnit = await unitService.deleteLogs(id)
      setUnits(units.map((unit) => (unit.id !== id ? unit : returnedUnit?.data)))
    } catch (error: any) {
      const status = error?.response.status
      if (status === 401 || status === 422) {
        deauthorize()
      }
    }
  }

  const waterNow = async (id: string) => {
    try {
      const response = await unitService.waterPlant(id)
      setUnits((prevUnits) => prevUnits.map((unit) => (unit.id !== id ? unit : response?.data.unit)))
      setDeviceSettings({ ...deviceSettings, waterAmount: response.data.waterAmount })
    } catch (error: any) {
      const status = error?.response.status
      if (status === 401 || status === 422) {
        deauthorize()
      }
      if (status === 400) {
        toast(error.response.data.message, 5000)
      } else if (status === 401 || status === 422) {
        deauthorize()
      } else {
        setIsBackendConnected(false)
      }
    } finally {
      return true
    }
  }

  const handleDeviceSettingsChange = async (event: React.MouseEvent, settings: IDeviceSettingsState) => {
    event.preventDefault()
    try {
      const returnedDeviceSettings = await deviceService.updateSettings(settings)
      if (returnedDeviceSettings?.status === 200) {
        setDeviceSettings(returnedDeviceSettings.data)
        if (units.length > returnedDeviceSettings.data.numberOfUnits) {
          setUnits(units.splice(0, returnedDeviceSettings.data.numberOfUnits))
        }

        if (units.length < returnedDeviceSettings.data.numberOfUnits) {
          fetchUnits()
        }
      }
    } catch (error: any) {
      const status = error?.response.status
      if (status === 401 || status === 422) {
        deauthorize()
      }
    }
  }

  const handleUnitChange = async (event: React.MouseEvent, unitSettings: IUnitToUpdate) => {
    event.preventDefault()
    try {
      const returnedUnit = await unitService.changeSettings(unitSettings)
      if (returnedUnit?.status === 200) {
        setUnits(units.map((unit) => (unit.id !== returnedUnit.data.id ? unit : returnedUnit.data)))
      }
    } catch (error: any) {
      const status = error?.response.status
      if (status === 401 || status === 422) {
        deauthorize()
      }
    }
  }

  const handleUnitCalibration = async (event: React.MouseEvent, id: IUnitState['id'], moistValueType: string) => {
    event.preventDefault()
    try {
      const returnedUnit = await unitService.calibrateUnit(id, moistValueType)
      if (returnedUnit?.status === 200) {
        setUnits(units.map((unit) => (unit.id !== returnedUnit.data.id ? unit : returnedUnit.data)))
      }
    } catch (error: any) {
      const status = error?.response.status
      if (status === 401 || status === 422) {
        deauthorize()
      }
    }
  }

  const handleClearWaterCounter = async (id: IUnitState['id']) => {
    try {
      const returnedUnit = await unitService.deleteWaterCounter(id)
      if (returnedUnit?.status === 200) {
        setUnits(units.map((unit) => (unit.id !== returnedUnit.data.id ? unit : returnedUnit.data)))
      }
    } catch (error: any) {
      const status = error?.response.status
      if (status === 401 || status === 422) {
        deauthorize()
      }
    }
  }

  if (!isInitialized) {
    return null
  }

  return (
    <IonPage>
      <Switch>
        {!isLoggedIn ? (
          <Route
            path="/login"
            render={() => (
              <Login
                username={username}
                setUsername={setUsername}
                password={password}
                setPassword={setPassword}
                handleLogin={handleLogin}
                loginSpinner={loginSpinner}
              />
            )}
          ></Route>
        ) : (
          <Route
            exact
            path="/"
            render={() => (
              <>
                <Menu
                  deviceSettings={deviceSettings!}
                  handleDeviceSettingsChange={handleDeviceSettingsChange}
                  handleLogout={handleLogout}
                  handleShutdown={handleShutdown}
                />
                <IonPage id="main-content">
                  <Header isBackendConnected={isBackendConnected} refresh={refresh} deviceSettings={deviceSettings} />
                  <IonContent>
                    <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                      <IonRefresherContent></IonRefresherContent>
                    </IonRefresher>
                    {units.map((unit) => (
                      <Unit
                        key={unit.id}
                        unit={unit}
                        setUnits={setUnits}
                        handleUnitChange={handleUnitChange}
                        waterNow={waterNow}
                        deleteLogs={deleteLogs}
                        waterNowDisabled={waterNowDisabeled}
                        setWaterNowDisabled={setWaterNowDisabled}
                        handleUnitCalibration={handleUnitCalibration}
                        handleClearWaterCounter={handleClearWaterCounter}
                      />
                    ))}
                  </IonContent>
                </IonPage>
              </>
            )}
          ></Route>
        )}
        <Route path="*" render={() => <Redirect to={isLoggedIn ? '/' : '/login'} />} />
      </Switch>
    </IonPage>
  )
}

export default Home
