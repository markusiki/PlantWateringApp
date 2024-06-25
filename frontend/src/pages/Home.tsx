import {
  IonAlert,
  IonApp,
  IonButton,
  IonButtons,
  IonCard,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonPage,
  IonProgressBar,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
  useIonToast,
} from '@ionic/react'
import { settingsOutline } from 'ionicons/icons'
import './Home.css'
import { useEffect, useState } from 'react'
import { IUnitState, IDeviceSettingsState, IUnitSettingsState } from '../interfaces'
import Log from '../components/Log'
import UnitSettings from '../components/UnitSettings'
import userService from '../services/user'
import unitService from '../services/units'
import deviceService from '../services/device'
import Login from '../components/Login'
import Menu from '../components/Menu'

const Home: React.FC = () => {
  const [user, setUser] = useState('')
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [units, setUnits] = useState<IUnitState[]>([])
  const [backendStatus, setBackendStatus] = useState<boolean>(false)
  const [deviceSettings, setDeviceSettings] = useState<IDeviceSettingsState>({
    autoWatering: true,
    moistMeasureInterval: 0,
  })
  const [waterNowDisabeled, setWaterNowDisabled] = useState(false)

  const [toast] = useIonToast()

  useEffect(() => {}, [user])

  const setCounter = async (unitToCount: IUnitState) => {
    setUnits((prevUnits) =>
      prevUnits.map((unit: IUnitState) =>
        unit.id !== unitToCount.id ? unit : { ...unit, counter: unit.waterTime + 1 }
      )
    )
    let counter = unitToCount.waterTime
    while (counter! > 0) {
      setUnits((prevUnits) =>
        prevUnits.map((unit) =>
          unit.id !== unitToCount.id ? unit : { ...unit, counter: unit.counter! - 1 }
        )
      )
      counter--
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  const handleLogin = async (event: React.MouseEvent) => {
    event.preventDefault()
    try {
      const response = await userService.login({ username, password })
      if (response?.status === 200) {
        setUsername('')
        setPassword('')
        setUser(response.data.username)
        refresh()
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
      setUnits([])
      setUser('')
    }
  }

  const refresh = async () => {
    try {
      const deviceResponse = await deviceService.getAll()
      if (deviceResponse?.status === 200) {
        setBackendStatus(true)
        setDeviceSettings(deviceResponse.data)
      }

      const unitsResponse = await unitService.getAll()
      if (unitsResponse?.status === 200) {
        setBackendStatus(true)
        setUnits(unitsResponse.data)
      }
    } catch (error: any) {
      setBackendStatus(false)
      if (error.response.status === 401) {
        setUser('')
      }
    }
  }

  const setColor = (moistValue: IUnitState['moistValue']) => {
    if (moistValue < 0.33) {
      return 'danger'
    }
    if (moistValue >= 0.33 && moistValue < 0.66) {
      return 'success'
    } else {
      return 'primary'
    }
  }

  const deleteLogs = async (event: React.MouseEvent, id: string) => {
    event.preventDefault()
    try {
      const returnedUnit = await unitService.deleteLogs(id)
      setUnits(units.map((unit) => (unit.id !== id ? unit : returnedUnit?.data)))
    } catch (error: any) {
      if (error.response.status === 401) {
        setUser('')
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
        setUser('')
      }
      setBackendStatus(false)
    } finally {
      setWaterNowDisabled(false)
    }
  }

  const handleDeciveSettingsChange = async (
    event: React.MouseEvent,
    settings: IDeviceSettingsState
  ) => {
    event.preventDefault()
    try {
      const returnedDeviceSettings = await deviceService.updateSettings(settings)
      if (returnedDeviceSettings?.status === 200) {
        setDeviceSettings(returnedDeviceSettings.data)
      }
    } catch (error: any) {
      if (error.response.status === 401) {
        setUser('')
      }
    }
  }

  const handleUnitChange = async (
    event: React.MouseEvent,
    unitSettings: IUnitSettingsState,
    id: IUnitState['id']
  ) => {
    event.preventDefault()
    try {
      const unitToUpdate = { ...unitSettings, id: id }
      const returnedUnit = await unitService.changeSettings(unitToUpdate)
      if (returnedUnit?.status === 200) {
        setUnits(units.map((unit) => (unit.id !== returnedUnit.data.id ? unit : returnedUnit.data)))
      }
    } catch (error: any) {
      if (error.response.status === 401) {
        setUser('')
      }
    }
  }

  const getAbsoluteValue = (moistValue: IUnitState['moistValue']) => {
    const minValue = 8000
    const maxValue = 20000
    const absoluteValue =
      Math.round((1 - (moistValue - minValue) / (maxValue - minValue)) * 100) / 100

    if (absoluteValue > 1) {
      return 1.0
    }
    if (absoluteValue < 0) {
      return 0
    }
    return absoluteValue
  }

  const getRelativeValue = (unit: IUnitState) => {
    const minValue = 10000
    const maxValue = unit.moistLimit
    const relativeValue =
      Math.round((1 - (unit.moistValue - minValue) / (maxValue - minValue)) * 100) / 100
    if (relativeValue > 1) {
      return 1.0
    }
    if (relativeValue < 0) {
      return 0
    }
    return relativeValue
  }

  const buttonEffect = (unit: IUnitState) => {
    if (!unit.counter) {
      return 'Water now'
    } else {
      return (
        <p style={{ textTransform: 'capitalize' }}>
          Watering... {unit.counter} seconds to complete
        </p>
      )
    }
  }

  if (user === '') {
    return (
      <Login
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        handleLogin={handleLogin}
      ></Login>
    )
  }

  return (
    <IonApp>
      <Menu
        deviceSettings={deviceSettings}
        handleDeciveSettingsChange={handleDeciveSettingsChange}
        handleLogout={handleLogout}
      />
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton></IonMenuButton>
            </IonButtons>
            <IonText>Status: </IonText>
            {backendStatus ? (
              <IonText color={'success'}>Connected</IonText>
            ) : (
              <IonText color={'danger'}>Disconnected</IonText>
            )}

            <IonTitle slot="secondary">My plants</IonTitle>

            <IonButtons slot="end">
              <IonButton color={'primary'} onClick={refresh}>
                REFRESH
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {units.map((unit, index) => (
            <IonCard key={unit.id}>
              <IonGrid>
                <IonRow>
                  <IonCol>
                    <p>{unit.id}</p>
                  </IonCol>
                  <IonCol>
                    <h3 className="align-center">{unit.name}</h3>
                  </IonCol>
                  <IonCol class="ion-padding-start">
                    <IonButtons class="ion-justify-content-end">
                      <IonButton id={`${unit.id}-settings`}>
                        <IonIcon icon={settingsOutline}></IonIcon>
                      </IonButton>
                    </IonButtons>
                    <UnitSettings
                      unit={unit}
                      index={index}
                      units={units}
                      handleUnitChange={handleUnitChange}
                    />
                  </IonCol>
                </IonRow>
                <IonRow>
                  {unit.status === 'OK' ? (
                    <IonCol>
                      <p className="align-center">
                        Status: <IonText color="success">{unit.status}</IonText>
                      </p>
                    </IonCol>
                  ) : (
                    <IonCol>
                      <p className="align-center">
                        Status: <IonText color="danger">{unit.status}</IonText>
                      </p>
                    </IonCol>
                  )}
                </IonRow>
                <IonRow>
                  <IonCol>
                    <p className="align-center">Moist Value:{unit.moistValue}</p>
                  </IonCol>
                </IonRow>
                <IonRow class="ion-justify-content-center">
                  <IonCol class="ion-align-self-end" size="auto">
                    <IonText>
                      <p>Relative moist level:</p>
                    </IonText>
                  </IonCol>
                  <IonCol size="6">
                    <div className="moistValueDisplay">
                      <p className="moist-percent">{getRelativeValue(unit) * 100}%</p>
                    </div>
                    <IonProgressBar
                      value={getRelativeValue(unit)}
                      color={setColor(getRelativeValue(unit))}
                    ></IonProgressBar>
                  </IonCol>
                </IonRow>
                <IonRow class="ion-justify-content-center">
                  <IonCol class="ion-align-self-end" size="auto">
                    <IonText>
                      <p>Absolute moist level:</p>
                    </IonText>
                  </IonCol>
                  <IonCol size="6">
                    <div className="absMoistValueDisplay">
                      <p>air</p>
                      <p className="moist-percent">{getAbsoluteValue(unit.moistValue) * 100}%</p>
                      <p>water</p>
                    </div>
                    <IonProgressBar
                      value={getAbsoluteValue(unit.moistValue)}
                      color={setColor(getAbsoluteValue(unit.moistValue))}
                    ></IonProgressBar>
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol>
                    <IonText>
                      <p className="last-time-watered">
                        Last time watered:
                        <br />
                        {unit.logs.find((log) => log.watered === true)?.date}
                      </p>
                    </IonText>
                  </IonCol>
                </IonRow>
                <IonRow class="ion-align-items-center">
                  <IonCol class="ion-text-center">
                    <IonButton id={`${unit.id}-log`} shape="round" expand="block" color="danger">
                      Log
                    </IonButton>
                    <Log unit={unit} deleteLogs={deleteLogs}></Log>
                  </IonCol>
                  <IonCol class="ion-text-center">
                    <IonButton
                      id={`confirm-water-${unit.id}`}
                      shape="round"
                      expand="block"
                      color="primary"
                      disabled={waterNowDisabeled}
                    >
                      {buttonEffect(unit)}
                    </IonButton>
                    <IonAlert
                      header="Confirm"
                      message={`Confirm watering for ${unit.name}`}
                      trigger={`confirm-water-${unit.id}`}
                      buttons={[
                        {
                          text: 'CANCEL',
                          role: 'cancel',
                          handler: () => {
                            console.log('Watering canceled ' + unit.id)
                          },
                        },
                        {
                          text: 'WATER NOW',
                          role: 'confirm',
                          handler: () => {
                            waterNow(unit.id)
                            setCounter(unit)
                            console.log('Watering confirmed ' + unit.id)
                          },
                        },
                      ]}
                      onDidDismiss={({ detail }) =>
                        console.log(`Dismissed with role: ${detail.role}`)
                      }
                    ></IonAlert>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCard>
          ))}
        </IonContent>
      </IonPage>
    </IonApp>
  )
}

export default Home
