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
} from '@ionic/react'
import { IDeviceSettingsProps, IDeviceSettingsState } from '../interfaces'
import { useEffect, useRef, useState } from 'react'

const Settings: React.FC<IDeviceSettingsProps> = ({
  deviceSettings,
  handleDeciveSettingsChange,
}) => {
  const [settings, setSettings] = useState<IDeviceSettingsState>()
  const modal = useRef<HTMLIonModalElement>(null)

  useEffect(() => {
    setSettings({ moistMeasureIntervall: settings!.moistMeasureIntervall })
  }, [settings])

  const confirm = (
    event: React.MouseEvent<HTMLIonButtonElement, MouseEvent>
  ) => {
    handleDeciveSettingsChange(event, settings)
    modal.current?.dismiss()
  }

  return (
    <>
      <IonModal trigger={'settings'} ref={modal}>
        <IonHeader>
          <IonToolbar>
            <IonButtons>
              <IonButton onClick={() => modal.current?.dismiss()}>
                Cancel
              </IonButton>
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
              <IonInput
                label="Soil moisture measure intervall:"
                labelPlacement="stacked"
                value={settings?.moistMeasureIntervall}
                name="moistMeasureIntervall"
                type="number"
                inputMode="numeric"
                max={30}
                min={1}
                onInput={(event: any) =>
                  setSettings({
                    moistMeasureIntervall: parseInt(event.target.value),
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

export default Settings
