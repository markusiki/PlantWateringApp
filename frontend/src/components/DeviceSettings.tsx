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
} from '@ionic/react'
import { IDeviceSettingsProps, IDeviceSettingsState } from '../interfaces'
import { useEffect, useRef, useState } from 'react'

const DeviceSettings: React.FC<IDeviceSettingsProps> = ({
  deviceSettings,
  handleDeciveSettingsChange,
}) => {
  const [settings, setSettings] = useState<IDeviceSettingsState>({
    autoWatering: false,
    moistMeasureInterval: 1,
  })

  useEffect(() => {
    setSettings(deviceSettings)
  }, [deviceSettings])

  const modal = useRef<HTMLIonModalElement>(null)

  const confirm = (event: React.MouseEvent<HTMLIonButtonElement, MouseEvent>) => {
    handleDeciveSettingsChange(event, settings)
    modal.current?.dismiss()
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
              <IonButton onClick={confirm}>Confirm</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonList>
            <IonItem>
              <IonCheckbox
                justify="space-between"
                checked={settings.autoWatering}
                name="autoWatering"
                onIonChange={(event) =>
                  setSettings({ ...settings, autoWatering: event.detail.checked })
                }
              >
                Enable Automatic Watering
              </IonCheckbox>
            </IonItem>
            <IonItem>
              <IonInput
                label="Soil moisture measure intervall (days):"
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
          </IonList>
        </IonContent>
      </IonModal>
    </>
  )
}

export default DeviceSettings
