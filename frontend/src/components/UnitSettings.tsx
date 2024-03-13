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
  useIonAlert,
} from '@ionic/react'
import { IUnitSettingsProps, IUnitSettingsState } from '../interfaces'
import { useEffect, useRef, useState } from 'react'

const Settings: React.FC<IUnitSettingsProps> = ({ unit, index, units, handleUnitChange }) => {
  const [settings, setSettings] = useState<IUnitSettingsState>({
    name: '',
    moistLimit: 0,
    waterTime: 0,
  })

  const modal = useRef<HTMLIonModalElement>(null)
  const [presentAlert] = useIonAlert()

  useEffect(() => {
    setSettings({
      name: unit.name,
      moistLimit: unit.moistLimit,
      waterTime: unit.waterTime,
    })
  }, [unit.moistLimit, unit.name, unit.waterTime])

  const validateInputs = () => {
    if (settings.name.length > 100 || settings.name.length < 1) {
      presentAlert({
        header: 'Invalid input',
        message: 'Plant name must be between 1 and 100 characters.',
        buttons: ['Dismiss'],
      })
      return false
    }
    if (settings.moistLimit < 8000 || settings.moistLimit > 20000) {
      presentAlert({
        header: 'Invalid input',
        message: 'Moisture level limit must be between 8000 and 20000.',
        buttons: ['Dismiss'],
      })
      return false
    }
    if (settings.waterTime < 0 || settings.waterTime > 180) {
      presentAlert({
        header: 'Invalid input',
        message: 'Water time must be between 0 and 180.',
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
      handleUnitChange(event, settings, unit.id)
      modal.current?.dismiss()
    }
  }

  const handleChange = (event: any) => {
    setSettings({ ...settings, [event.target.name]: event.target.value })
  }

  return (
    <>
      <IonModal trigger={`${unit.id}-settings`} ref={modal}>
        <IonHeader>
          <IonToolbar>
            <IonButtons>
              <IonButton onClick={() => modal.current?.dismiss()}>Cancel</IonButton>
            </IonButtons>
            <IonTitle slot="secondary">Settings</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={(event) => confirm(event)}>Confirm</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonList>
            <IonItem>
              <IonInput
                label="Plant name"
                value={settings.name}
                name="name"
                labelPlacement="stacked"
                onInput={handleChange}
                type="text"
                minlength={2}
                maxlength={100}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Set moisture level limit value between 10000 (wet) and 18000 (dry)."
                value={settings.moistLimit}
                name="moistLimit"
                labelPlacement="stacked"
                type="number"
                min={10000}
                max={18000}
                onInput={handleChange}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Set watering time in seconds (0 - 180)"
                value={settings.waterTime}
                name="waterTime"
                labelPlacement="stacked"
                onInput={handleChange}
                type="number"
                min={0}
                max={180}
              />
            </IonItem>
          </IonList>
        </IonContent>
      </IonModal>
    </>
  )
}

export default Settings
