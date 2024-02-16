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
import { IUnitState } from '../interfaces'
import Log from '../components/Log'
import Settings from '../components/Settings'
import unitService from '../services/units'

const Home: React.FC = () => {
  const [units, setUnits] = useState<IUnitState[]>([
    {
      id: 'Unit 1',
      name: 'Plant name',
      status: 'OK',
      moistLevel: 0.5,
      moistLimit: 15000,
      waterTime: 10,
      moistMeasureIntervall: 10,
      logs: [
        '12.12.2023 12:00',
        '18.12.2023 12:00',
        '25.12.2023 12:00',
        '29.12.2023 12:00',
      ],
    },
    {
      id: 'Unit 2',
      name: 'Plant name',
      status: 'ERROR',
      moistLevel: 0.1,
      moistLimit: 15000,
      waterTime: 15,
      moistMeasureIntervall: 4,
      logs: [
        '12.12.2023 12:00',
        '17.12.2023 12:00',
        '24.12.2023 12:00',
        '29.12.2023 12:00',
      ],
    },
    {
      id: 'Unit 3',
      name: 'Plant name',
      status: 'OK',
      moistLevel: 0.3,
      moistLimit: 15000,
      waterTime: 20,
      moistMeasureIntervall: 7,
      logs: [
        '12.12.2023 12:00',
        '19.12.2023 12:00',
        '28.12.2023 12:00',
        '29.12.2023 12:00',
      ],
    },
    {
      id: 'Unit 4',
      name: 'Plant name',
      status: 'OK',
      moistLevel: 0.9,
      moistLimit: 15000,
      waterTime: 25,
      moistMeasureIntervall: 5,
      logs: [
        '12.12.2023 12:00',
        '16.12.2023 12:00',
        '20.12.2023 12:00',
        '25.12.2023 12:00',
      ],
    },
  ])
  /* const units = [
    { unit: unit1, setUnit: setUnit1 },
    { unit: unit2, setUnit: setUnit2 },
    { unit: unit3, setUnit: setUnit3 },
    { unit: unit4, setUnit: setUnit4 },
  ] */

  useEffect(() => {
    refresh()
  }, [])

  const refresh = () => {
    unitService.getAll().then((data) => {
      setUnits(data)
      console.log(units)
      /* data.forEach((element: any) => {
        console.log('element.id: ', element.id)
        units.forEach((unit: any) => {
          console.log('unit.id: ', unit.id)
          if (unit.id === element.id) {
            setUnits({ ...units, [unit.moistLevel]: element.moistLevel })
            console.log(
              'unitId: ',
              e.unit.id,
              'elementMoistLevel: ',
              element.moistLevel
            )
            console.log('elemenId: ', element.id)
          }
        })
      }) */
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
    /* code to water */
    console.log(unit.id)
    return <></>
  }

  return (
    <IonApp>
      <IonPage>
        <IonHeader>
          <IonToolbar>
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
                    <Settings
                      unit={unit}
                      index={index}
                      units={units}
                      setUnits={setUnits}
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
