import { IonApp, IonContent, IonPage, IonRefresher, IonRefresherContent, RefresherEventDetail, useIonToast } from '@ionic/react'
import './Home.css'
import { useEffect, useState } from 'react'
import { IUnitState, IDeviceSettingsState, IUnitSettingsState } from '../interfaces'
import serviceHelper from '../services/helpers'
import userService from '../services/user'
import unitService from '../services/units'
import deviceService from '../services/device'
import Login from './Login'
import Menu from '../components/Menu'
import Unit from '../components/Unit'
import Header from '../components/Header'

const Home: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [units, setUnits] = useState<IUnitState[]>([])
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false)
  const [deviceSettings, setDeviceSettings] = useState<IDeviceSettingsState>({
    runTimeProgram: true,
    moistMeasureInterval: 0,
    numberOfUnits: 4,
  })
  const [waterNowDisabeled, setWaterNowDisabled] = useState(false)

  const [toast] = useIonToast()

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

  const deauthorize = () => {
    setUnits([])
    setIsLoggedIn(false)
    window.localStorage.removeItem('user')
  }

  const handleLogin = async (event: React.MouseEvent) => {
    event.preventDefault()
    try {
      const response = await userService.login({ username, password })
      if (response?.status === 200) {
        window.localStorage.setItem('user', username)
        serviceHelper.setUser(username)
        setUsername('')
        setPassword('')
        setIsLoggedIn(true)
      }
    } catch (error: any) {
      toast({
        message: error?.response.data.message,
        duration: 1500,
        position: 'middle',
      })
    }
  }

  const handleLogout = async (event: React.MouseEvent) => {
    event.preventDefault()
    try {
      const response = await userService.logout()
      toast({ message: response.data.message, duration: 1500, position: 'middle' })

      console.log(response.data.message)
    } catch (error) {
    } finally {
      deauthorize()
    }
  }

  const fetchDeviceSettings = async () => {
    try {
      const deviceResponse = await deviceService.getAll()
      if (deviceResponse?.status === 200) {
        setIsBackendConnected(true)
        setDeviceSettings(deviceResponse.data)
        setIsLoggedIn(true)
      }
    } catch (error: any) {
      setIsBackendConnected(false)
      if (error.response.status === 401) {
        deauthorize()
      }
    }
  }

  const fetchUnits = async () => {
    try {
      const unitsResponse = await unitService.getAll()
      if (unitsResponse?.status === 200) {
        setIsBackendConnected(true)
        setUnits(unitsResponse.data)
      }
    } catch (error: any) {
      setIsBackendConnected(false)
      if (error.response.status === 401) {
        deauthorize()
      }
    }
  }

  const refresh = async () => {
    fetchDeviceSettings()
    fetchUnits()
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
      if (error.response.status === 401) {
        deauthorize()
      }
    }
  }

  const waterNow = async (id: string) => {
    setWaterNowDisabled(true)
    try {
      const returnedUnit = await unitService.waterPlant(id)
      console.log('status: ', returnedUnit?.status)
      setUnits((prevUnits) => prevUnits.map((unit) => (unit.id !== id ? unit : returnedUnit?.data)))
    } catch (error: any) {
      if (error.response.status === 401) {
        deauthorize()
      }
      setIsBackendConnected(false)
    } finally {
      setWaterNowDisabled(false)
    }
  }

  const handleDeciveSettingsChange = async (event: React.MouseEvent, settings: IDeviceSettingsState) => {
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
      if (error.response.status === 401) {
        deauthorize()
      }
    }
  }

  const handleUnitChange = async (event: React.MouseEvent, unitSettings: IUnitSettingsState, id: IUnitState['id']) => {
    event.preventDefault()
    try {
      const unitToUpdate = { ...unitSettings, id: id }
      const returnedUnit = await unitService.changeSettings(unitToUpdate)
      if (returnedUnit?.status === 200) {
        setUnits(units.map((unit) => (unit.id !== returnedUnit.data.id ? unit : returnedUnit.data)))
      }
    } catch (error: any) {
      if (error.response.status === 401) {
        deauthorize()
      }
    }
  }

  if (!isInitialized) {
    return null
  }

  if (!isLoggedIn) {
    return <Login username={username} setUsername={setUsername} password={password} setPassword={setPassword} handleLogin={handleLogin}></Login>
  }
  return (
    <IonApp>
      <Menu deviceSettings={deviceSettings} handleDeciveSettingsChange={handleDeciveSettingsChange} handleLogout={handleLogout} />
      <IonPage id="main-content">
        <Header isBackendConnected={isBackendConnected} refresh={refresh} />
        <IonContent>
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent></IonRefresherContent>
          </IonRefresher>
          {units.map((unit) => (
            <Unit unit={unit} setUnits={setUnits} handleUnitChange={handleUnitChange} waterNow={waterNow} deleteLogs={deleteLogs} waterNowDisabeled={waterNowDisabeled} />
          ))}
        </IonContent>
      </IonPage>
    </IonApp>
  )
}

export default Home
