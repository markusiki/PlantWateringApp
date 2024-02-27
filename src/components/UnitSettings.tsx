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
import { IUnitSettingsProps, IUnitSettingsState } from '../interfaces'
import { useEffect, useRef, useState } from 'react'

const Settings: React.FC<IUnitSettingsProps> = ({
  unit,
  index,
  units,
  handleUnitChange,
}) => {
  const [settings, setSettings] = useState<IUnitSettingsState>({
    name: '',
    moistLimit: 0,
    waterTime: 0,
  })
  const modal = useRef<HTMLIonModalElement>(null)

  useEffect(() => {
    setSettings({
      name: unit.name,
      moistLimit: unit.moistLimit,
      waterTime: unit.waterTime,
    })
  }, [unit.moistLimit, unit.name, unit.waterTime])

  const confirm = (
    event: React.MouseEvent<HTMLIonButtonElement, MouseEvent>
  ) => {
    handleUnitChange(event, settings, unit.id)
    modal.current?.dismiss()
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
              <IonButton onClick={() => modal.current?.dismiss()}>
                Cancel
              </IonButton>
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
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Set moisture level limit"
                value={settings.moistLimit}
                name="moistLimit"
                labelPlacement="stacked"
                onInput={handleChange}
                type="number"
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Set watering time in seconds"
                value={settings.waterTime}
                name="waterTime"
                labelPlacement="stacked"
                onInput={handleChange}
                type="number"
              />
            </IonItem>
          </IonList>
        </IonContent>
      </IonModal>
    </>
  )
}

export default Settings
