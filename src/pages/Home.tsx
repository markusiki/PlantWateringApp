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
import {
  IUnitSettingsProps,
  IUnitState,
  IDeviceSettingsState,
} from '../interfaces'
import Log from '../components/Log'
import UnitSettings from '../components/UnitSettings'
import unitService from '../services/units'
import Settings from '../components/DeviceSettings'
import deviceService from '../services/device'

const Home: React.FC = () => {
  const [units, setUnits] = useState<IUnitState[]>([])
  const [backendStatus, setBackendStatus] = useState<boolean>(false)
  const [deviceSettings, setDeviceSettings] = useState<IDeviceSettingsState>({
    autoWatering: true,
    moistMeasureIntervall: 0,
  })

  useEffect(() => {
    refresh()
  }, [])

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

  const setColor = (unit: IUnitState) => {
    if (unit.moistLevel < 0.33) {
      return 'danger'
    }
    if (unit.moistLevel >= 0.33 && unit.moistLevel < 0.66) {
      return 'success'
    } else {
      return 'primary'
    }
  }

  const waterNow = (unit: IUnitState) => {
    unitService.waterPlant(unit.id)
  }

  const handleDeciveSettingsChange = async (
    event: React.MouseEvent,
    settings: IDeviceSettingsState
  ) => {
    event.preventDefault()
    const returnedDeviceSettings = await deviceService.updateSettings(settings)
    setDeviceSettings(returnedDeviceSettings)
  }

  const handleUnitChange = async (
    event: React.MouseEvent,
    unitSettings: IUnitSettingsProps,
    id: IUnitState['id']
  ) => {
    event.preventDefault()
    const returnedUnit = await unitService.changeSettigs(unitSettings, id)
    setUnits(
      units.map((unit) => (unit.id !== returnedUnit.id ? unit : returnedUnit))
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
              ></Settings>
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
                      <p style={{ textAlign: 'end' }}>Moist level:</p>
                    </IonText>
                  </IonCol>
                  <IonCol size="6">
                    <p className="moist-percent">{unit.moistLevel * 100}%</p>
                    <IonProgressBar
                      value={unit.moistLevel}
                      color={setColor(unit)}
                    ></IonProgressBar>
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol>
                    <IonText>
                      <p className="last-time-watered">
                        Last time watered: <br /> {unit.logs[0]}{' '}
                      </p>
                    </IonText>
                  </IonCol>
                </IonRow>
                <IonRow class="ion-align-items-center">
                  <IonCol class="ion-text-center">
                    <IonButton
                      id={`${unit.id}-log`}
                      shape="round"
                      expand="block"
                      color="danger"
                    >
                      Log
                    </IonButton>
                    <Log unit={unit}></Log>
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
                            waterNow(unit)
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
