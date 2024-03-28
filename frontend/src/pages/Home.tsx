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
  IonLabel,
  IonPage,
  IonProgressBar,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react'
import { settingsOutline } from 'ionicons/icons'
import './Home.css'
import { useEffect, useState } from 'react'
import { IUnitState, IDeviceSettingsState, IUnitSettingsState, IUserState } from '../interfaces'
import Log from '../components/Log'
import UnitSettings from '../components/UnitSettings'
import loginService from '../services/login'
import unitService from '../services/units'
import Settings from '../components/DeviceSettings'
import deviceService from '../services/device'
import Login from '../components/Login'

const Home: React.FC = () => {
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [user, setUser] = useState<IUserState>({ username: null, token: null })
  const [units, setUnits] = useState<IUnitState[]>([])
  const [backendStatus, setBackendStatus] = useState<boolean>(false)
  const [deviceSettings, setDeviceSettings] = useState<IDeviceSettingsState>({
    autoWatering: true,
    moistMeasureInterval: 0,
  })

  useEffect(() => {
    refresh()
  }, [])

  const handleLogin = async (event: React.MouseEvent) => {
    event.preventDefault()
    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem('loggedUser', JSON.stringify(user))
      setUser({ username: user?.data.username, token: user?.data.token })
      setUsername('')
      setPassword('')
    } catch (exeption) {}
  }

  const refresh = () => {
    deviceService.getAll().then((response) => {
      if (response?.status === 200) {
        setBackendStatus(true)
        setDeviceSettings(response.data)
      } else {
        setBackendStatus(false)
      }
    })
    unitService.getAll().then((response) => {
      if (response?.status === 200) {
        setBackendStatus(true)
        setUnits(response.data)
      } else {
        setBackendStatus(false)
      }
    })
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
    const returnedUnit = await unitService.deleteLogs(id)
    setUnits(units.map((unit) => (unit.id !== id ? unit : returnedUnit?.data)))
  }

  const waterNow = async (id: string) => {
    const returnedUnit = await unitService.waterPlant(id)
    setUnits(units.map((unit) => (unit.id !== id ? unit : returnedUnit?.data)))
  }

  const handleDeciveSettingsChange = async (
    event: React.MouseEvent,
    settings: IDeviceSettingsState
  ) => {
    event.preventDefault()
    const returnedDeviceSettings = await deviceService.updateSettings(settings)
    if (returnedDeviceSettings?.status === 200) {
      setDeviceSettings(returnedDeviceSettings.data)
    }
  }

  const handleUnitChange = async (
    event: React.MouseEvent,
    unitSettings: IUnitSettingsState,
    id: IUnitState['id']
  ) => {
    event.preventDefault()
    const unitToUpdate = { ...unitSettings, id: id }
    const returnedUnit = await unitService.changeSettigs(unitToUpdate)
    if (returnedUnit?.status === 200) {
      setUnits(units.map((unit) => (unit.id !== returnedUnit.data.id ? unit : returnedUnit.data)))
    }
  }

  const getAbsoluteValue = (moistValue: IUnitState['moistValue']) => {
    const minValue = 10000
    const maxValue = 18000
    const absoluteValue =
      Math.round((1 - (moistValue - minValue) / (maxValue - minValue)) * 100) / 100
    return absoluteValue
  }

  const getRelativeValue = (unit: IUnitState) => {
    const minValue = unit.moistLimit
    const maxValue = 18000
    const relativeValue =
      Math.round((1 - (unit.moistValue - minValue) / (maxValue - minValue)) * 100) / 100
    if (relativeValue > 1) {
      return 1.0
    }
    return relativeValue
  }

  if (user.username === null) {
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
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons>
              <IonButton id="settings">
                <IonIcon icon={settingsOutline}></IonIcon>
              </IonButton>
              <Settings
                deviceSettings={deviceSettings}
                handleDeciveSettingsChange={handleDeciveSettingsChange}
              />
            </IonButtons>
            <IonLabel>Status: </IonLabel>
            {backendStatus ? (
              <IonLabel color={'success'}>Connected </IonLabel>
            ) : (
              <IonLabel color={'danger'}>Disconnected </IonLabel>
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
                <IonRow class="ion-justify-content-center">
                  <IonCol class="ion-align-self-end" size="auto">
                    <IonText>
                      <p style={{ textAlign: 'end' }}>Absolute moist level:</p>
                    </IonText>
                  </IonCol>
                  <IonCol size="6">
                    <p className="moist-percent">{getAbsoluteValue(unit.moistValue) * 100}%</p>
                    <IonProgressBar
                      value={getAbsoluteValue(unit.moistValue)}
                      color={setColor(getAbsoluteValue(unit.moistValue))}
                    ></IonProgressBar>
                  </IonCol>
                </IonRow>
                <IonRow class="ion-justify-content-center">
                  <IonCol class="ion-align-self-end" size="auto">
                    <IonText>
                      <p style={{ textAlign: 'end' }}>Relative moist level:</p>
                    </IonText>
                  </IonCol>
                  <IonCol size="6">
                    <p className="moist-percent">{getRelativeValue(unit) * 100}%</p>
                    <IonProgressBar
                      value={getRelativeValue(unit)}
                      color={setColor(getRelativeValue(unit))}
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
                    >
                      Water now
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
