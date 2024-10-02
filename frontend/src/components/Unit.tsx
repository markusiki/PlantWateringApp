import React from 'react'
import {
  IonCard,
  IonGrid,
  IonRow,
  IonCol,
  IonButtons,
  IonButton,
  IonIcon,
  IonText,
  IonProgressBar,
  IonAlert,
} from '@ionic/react'
import Log from './Log'
import UnitSettings from './UnitSettings'
import { IUnitProps, IUnitState } from '../interfaces'
import { settingsOutline } from 'ionicons/icons'

const Unit: React.FC<IUnitProps> = ({
  unit,
  setUnits,
  handleUnitChange,
  waterNow,
  deleteLogs,
  waterNowDisabled,
  setWaterNowDisabled,
}) => {
  const getAbsoluteValue = (moistValue: IUnitState['moistValue']) => {
    const minValue = 8000
    const maxValue = 20000
    const absoluteValue = Math.round((1 - (moistValue - minValue) / (maxValue - minValue)) * 100) / 100

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
    const relativeValue = Math.round((1 - (unit.moistValue - minValue) / (maxValue - minValue)) * 100) / 100

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
      return <p style={{ textTransform: 'capitalize' }}>Watering... {unit.counter} seconds to complete</p>
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

  const setCounter = async (unitToCount: IUnitState) => {
    setUnits((prevUnits) =>
      prevUnits.map((unit: IUnitState) =>
        unit.id !== unitToCount.id ? unit : { ...unit, counter: unit.waterTime + 1 }
      )
    )
    let counter = unitToCount.waterTime + 1
    while (true) {
      setUnits((prevUnits) =>
        prevUnits.map((unit) => (unit.id !== unitToCount.id ? unit : { ...unit, counter: unit.counter! - 1 }))
      )
      counter--
      if (counter === 0) {
        break
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  const handleWaterNow = async (unit: IUnitState) => {
    waterNow(unit.id)
    setWaterNowDisabled(true)
    await setCounter(unit)
    setWaterNowDisabled(false)
  }

  return (
    <>
      <IonCard key={unit.id}>
        <IonGrid>
          <IonRow>
            <IonCol>
              <p>{unit.id}</p>
            </IonCol>
            <IonCol>
              <h3 className="align-center">{unit.name}</h3>
            </IonCol>
            <IonCol className="ion-padding-start">
              <IonButtons className="ion-justify-content-end">
                <IonButton data-testid="settings-button" id={`${unit.id}-settings`}>
                  <IonIcon icon={settingsOutline}></IonIcon>
                </IonButton>
              </IonButtons>
              <UnitSettings unit={unit} handleUnitChange={handleUnitChange} />
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
          <IonRow className="ion-justify-content-center">
            <IonCol className="ion-align-self-end" size="auto">
              <IonText>
                <p>Relative moist level:</p>
              </IonText>
            </IonCol>
            <IonCol size="6">
              <div className="moistValueDisplay">
                <p data-testid="rel-moist-value" className="moist-percent">
                  {(getRelativeValue(unit) * 100).toFixed(0)}%
                </p>
              </div>
              <IonProgressBar value={getRelativeValue(unit)} color={setColor(getRelativeValue(unit))}></IonProgressBar>
            </IonCol>
          </IonRow>
          <IonRow className="ion-justify-content-center">
            <IonCol className="ion-align-self-center" size="auto">
              <IonText>
                <p>Absolute moist level:</p>
              </IonText>
            </IonCol>
            <IonCol size="6">
              <div className="align-center">
                <p data-testid="abs-moist-value" className="moist-percent">
                  {(getAbsoluteValue(unit.moistValue) * 100).toFixed(0)}%
                </p>
              </div>
              <IonProgressBar
                value={getAbsoluteValue(unit.moistValue)}
                color={setColor(getAbsoluteValue(unit.moistValue))}
              ></IonProgressBar>
              <IonRow className="ion-justify-content-between">
                <p>air</p>
                <p>water</p>
              </IonRow>
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
          <IonRow className="ion-align-items-center">
            <IonCol className="ion-text-center">
              <IonButton id={`${unit.id}-log`} shape="round" expand="block" color="danger">
                Log
              </IonButton>
              <Log unit={unit} deleteLogs={deleteLogs}></Log>
            </IonCol>
            <IonCol className="ion-text-center">
              <IonButton
                id={`confirm-water-${unit.id}`}
                shape="round"
                expand="block"
                color="primary"
                disabled={waterNowDisabled}
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
                  },
                  {
                    text: 'WATER NOW',
                    role: 'confirm',
                    handler: () => {
                      handleWaterNow(unit)
                    },
                  },
                ]}
              ></IonAlert>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonCard>
    </>
  )
}

export default Unit
