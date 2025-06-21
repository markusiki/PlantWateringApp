import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  useIonAlert,
  IonText,
  IonCol,
  IonGrid,
  IonRow,
} from '@ionic/react'
import { IUnitCalibrationProps } from '../interfaces'
import { useEffect, useRef, useState } from 'react'
import './UnitSettings.css'
import unitService from '../services/units'

const UnitCalibration: React.FC<IUnitCalibrationProps> = ({
  isCalibrating,
  setIsCalibrating,
  unit,
  handleUnitCalibration,
}) => {
  const [rawMoistValue, setRawMoistValue] = useState({ moistValue: 0, standardDeviation: 0 })
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const rawMoistValueRef = useRef({})
  const [presentAlert] = useIonAlert()

  useEffect(() => {
    if (isCalibrating) {
      intervalRef.current = setInterval(getRawMoistValue, 2000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isCalibrating])

  useEffect(() => {
    rawMoistValueRef.current = rawMoistValue
  }, [rawMoistValue])

  const getRawMoistValue = async () => {
    try {
      const response = await unitService.getRawMoistValue(unit.id)
      setRawMoistValue(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  const calibrateUnit = async (event: React.MouseEvent<HTMLIonButtonElement, MouseEvent>, moistType: string) => {
    event.preventDefault()
    presentAlert({
      header: `Calibrate ${moistType} moist value`,
      message:
        moistType === 'wet'
          ? "Place unit's moisture sensor in a very wet soil, let it settle for a couple of seconds, and click calibrate."
          : "Place unit's moisture sensor in a very dry soil, and click calibrate.",
      cssClass: 'calibration-alert',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Calibrate',
          role: 'confirm',
          handler: async () => {
            await handleUnitCalibration(event, unit.id, moistType)
          },
        },
      ],
    })
  }

  return (
    <>
      <IonModal isOpen={isCalibrating} backdropDismiss={true} onDidDismiss={() => setIsCalibrating(false)}>
        <IonHeader>
          <IonToolbar>
            <IonGrid>
              <IonRow>
                <IonCol size="2">
                  <IonButtons>
                    <IonButton
                      onClick={() => {
                        setIsCalibrating(false)
                      }}
                    >
                      Dismiss
                    </IonButton>
                  </IonButtons>
                </IonCol>
                <IonCol size="8">
                  <IonTitle className="align-center">Unit moist calibration</IonTitle>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding align-center">
          <IonText>
            <p>Current raw moist value: {Math.round(rawMoistValue.moistValue)}</p>
            <p>Standard deviation: {Math.round(rawMoistValue.standardDeviation)}</p>
            <br />
            <p>Calibrated wet moist value: {unit.wetMoistValue}</p>
            <p>Calibrated dry moist value: {unit.dryMoistValue}</p>
          </IonText>
          <div style={{ marginTop: '10%' }}>
            <IonButton onClick={(event) => calibrateUnit(event, 'dry')}>Calibrate dry moist value</IonButton>
            <IonButton onClick={(event) => calibrateUnit(event, 'wet')}>Calibrate wet moist value</IonButton>
          </div>
        </IonContent>
      </IonModal>
    </>
  )
}

export default UnitCalibration
