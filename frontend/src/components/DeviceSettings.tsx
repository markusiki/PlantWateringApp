import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonCheckbox,
  useIonAlert,
} from '@ionic/react'
import { IDeviceSettingsProps, IDeviceSettingsState } from '../interfaces'
import { useEffect, useRef, useState } from 'react'

const DeviceSettings: React.FC<IDeviceSettingsProps> = ({ deviceSettings, handleDeviceSettingsChange }) => {
  const [settings, setSettings] = useState<IDeviceSettingsState>({
    runTimeProgram: false,
    moistMeasureInterval: 1,
    numberOfUnits: 4,
    tankVolume: 0,
    waterAmount: 0,
  })

  useEffect(() => {
    setSettings(deviceSettings)
  }, [deviceSettings])

  const modal = useRef<HTMLIonModalElement>(null)
  const [presentAlert] = useIonAlert()

  const validateInputs = () => {
    if (settings.moistMeasureInterval < 1 || settings.moistMeasureInterval > 30) {
      presentAlert({
        header: 'Invalid input',
        message: 'Moist measure interval must be between 1 and 30!',
        buttons: ['Dismiss'],
      })
      return false
    }
    if (settings.numberOfUnits < 1 || settings.numberOfUnits > 4) {
      presentAlert({
        header: 'Invalid input',
        message: 'Number of units must be between 1 and 4!',
        buttons: ['Dismiss'],
      })
      return false
    }
    if (settings.tankVolume < 1 || settings.tankVolume > 100000 || settings.tankVolume < settings.waterAmount) {
      presentAlert({
        header: 'Invalid input',
        message: 'Tank volume must be between 1 and 100 000 and bigger than water amount',
        buttons: ['Dismiss'],
      })
      return false
    }
    if (settings.waterAmount < 1 || settings.waterAmount > 100000 || settings.waterAmount > settings.tankVolume) {
      presentAlert({
        header: 'Invalid input',
        message: 'Water amount must be between 1 and 100 000 and smaller than tank volume!',
        buttons: ['Dismiss'],
      })
      return false
    } else {
      return true
    }
  }

  const confirm = (event: React.MouseEvent<HTMLIonButtonElement, MouseEvent>) => {
    const validInputs = validateInputs()

    if (validInputs) {
      handleDeviceSettingsChange(event, settings)
      modal.current?.dismiss()
    }
  }

  return (
    <>
      <IonModal trigger={'settings'} ref={modal}>
        <IonHeader>
          <IonToolbar>
            <IonButtons>
              <IonButton onClick={() => modal.current?.dismiss()}>Cancel</IonButton>
            </IonButtons>
            <IonTitle slot="secondary">Device Settings</IonTitle>
            <IonButtons slot="end">
              <IonButton data-testid="confirmDeviceSettingsButton" onClick={confirm}>
                Confirm
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonList>
            <IonItem>
              <IonCheckbox
                justify="space-between"
                checked={settings.runTimeProgram}
                name="runTimeProgram"
                onIonChange={(event: any) => setSettings({ ...settings, runTimeProgram: event.detail.checked })}
              >
                Enable time program
              </IonCheckbox>
            </IonItem>
            <IonItem>
              <IonInput
                label="Soil moisture measure interval (days):"
                labelPlacement="stacked"
                value={settings.moistMeasureInterval}
                name="moistMeasureInterval"
                type="number"
                inputMode="numeric"
                max={30}
                min={1}
                onInput={(event) =>
                  setSettings({
                    ...settings,
                    moistMeasureInterval: parseInt((event.target as HTMLInputElement).value),
                  })
                }
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Number of units"
                labelPlacement="stacked"
                value={settings.numberOfUnits}
                name="numberOfUnits"
                type="number"
                inputMode="numeric"
                max={4}
                min={1}
                onInput={(event) =>
                  setSettings({
                    ...settings,
                    numberOfUnits: parseInt((event.target as HTMLInputElement).value),
                  })
                }
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Water tank volume"
                labelPlacement="stacked"
                value={settings.tankVolume}
                name="tankVolume"
                type="number"
                inputMode="numeric"
                max={100000}
                min={1}
                onInput={(event) =>
                  setSettings({
                    ...settings,
                    tankVolume: parseInt((event.target as HTMLInputElement).value),
                  })
                }
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Water amount"
                labelPlacement="stacked"
                value={settings.waterAmount}
                name="waterAmount"
                type="number"
                inputMode="numeric"
                max={100000}
                min={1}
                onInput={(event) =>
                  setSettings({
                    ...settings,
                    waterAmount: parseInt((event.target as HTMLInputElement).value),
                  })
                }
              />
            </IonItem>
          </IonList>
        </IonContent>
      </IonModal>
    </>
  )
}

export default DeviceSettings
