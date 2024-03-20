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
  IonCheckbox,
} from '@ionic/react'
import { IUnitSettingsProps, IUnitSettingsState } from '../interfaces'
import { useEffect, useRef, useState } from 'react'

const UnitSettings: React.FC<IUnitSettingsProps> = ({ unit, index, units, handleUnitChange }) => {
  const [settings, setSettings] = useState<IUnitSettingsState>({
    name: '',
    moistLimit: 0,
    waterTime: 0,
    enableMaxWaterInterval: false,
    enableMinWaterInterval: false,
    maxWaterInterval: 0,
    minWaterInterval: 0,
  })

  const modal = useRef<HTMLIonModalElement>(null)
  const [presentAlert] = useIonAlert()

  useEffect(() => {
    setSettings({
      name: unit.name,
      moistLimit: unit.moistLimit,
      waterTime: unit.waterTime,
      enableMaxWaterInterval: unit.enableMaxWaterInterval,
      enableMinWaterInterval: unit.enableMinWaterInterval,
      maxWaterInterval: unit.maxWaterInterval,
      minWaterInterval: unit.minWaterInterval,
    })
  }, [
    unit.enableMaxWaterInterval,
    unit.enableMinWaterInterval,
    unit.maxWaterInterval,
    unit.minWaterInterval,
    unit.moistLimit,
    unit.name,
    unit.waterTime,
  ])

  const validateInputs = () => {
    if (settings.name.length > 100 || settings.name.length < 1) {
      presentAlert({
        header: 'Invalid input',
        message: 'Plant name must be between 1 and 100 characters!',
        buttons: ['Dismiss'],
      })
      return false
    }
    if (settings.moistLimit < 8000 || settings.moistLimit > 20000) {
      presentAlert({
        header: 'Invalid input',
        message: 'Moisture level limit must be between 8000 and 20000!',
        buttons: ['Dismiss'],
      })
      return false
    }
    if (settings.waterTime < 0 || settings.waterTime > 180) {
      presentAlert({
        header: 'Invalid input',
        message: 'Water time must be between 0 and 180!',
        buttons: ['Dismiss'],
      })
      return false
    }
    if (
      settings.minWaterInterval < 1 ||
      settings.minWaterInterval > 180 ||
      settings.maxWaterInterval < 1 ||
      settings.maxWaterInterval > 180
    ) {
      presentAlert({
        header: 'Invalid input',
        message: 'Water Interval must be between 1 and 180!',
        buttons: ['Dismiss'],
      })
      return false
    }
    if (settings.minWaterInterval > settings.maxWaterInterval) {
      presentAlert({
        header: 'Invalid input',
        message:
          'Minimun water interwall must be longer that or equal than maximum water Interval!',
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
    if (event.target.name === 'name') {
      setSettings({ ...settings, [event.target.name]: event.target.value })
    }
    if (event.target.localName === 'ion-checkbox') {
      setSettings({ ...settings, [event.target.name]: event.detail.checked })
    } else {
      setSettings({ ...settings, [event.target.name]: parseInt(event.target.value) })
    }
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
                type="text"
                minlength={2}
                maxlength={100}
                onInput={handleChange}
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
                type="number"
                min={0}
                max={180}
                onInput={handleChange}
              />
            </IonItem>
            <IonItem>
              <IonCheckbox
                justify="space-between"
                checked={settings.enableMinWaterInterval}
                name="enableMinWaterInterval"
                onIonChange={handleChange}
              >
                Enable minimun watering Interval
              </IonCheckbox>
            </IonItem>
            <li hidden={!settings.enableMinWaterInterval}>
              <IonItem>
                <IonInput
                  label="Set minimum watering interval (days)"
                  value={settings.minWaterInterval}
                  name="minWaterInterval"
                  labelPlacement="stacked"
                  type="number"
                  min={1}
                  max={180}
                  onInput={handleChange}
                />
              </IonItem>
            </li>
            <IonItem>
              <IonCheckbox
                justify="space-between"
                checked={settings.enableMaxWaterInterval}
                name="enableMaxWaterInterval"
                onIonChange={handleChange}
              >
                Enable maximum watering Interval
              </IonCheckbox>
            </IonItem>
            <li hidden={!settings.enableMaxWaterInterval}>
              <IonItem>
                <IonInput
                  label="Set maximum watering interval (days)"
                  value={settings.maxWaterInterval}
                  name="maxWaterInterval"
                  labelPlacement="stacked"
                  onInput={handleChange}
                  type="number"
                  min={1}
                  max={180}
                />
              </IonItem>
            </li>
          </IonList>
        </IonContent>
      </IonModal>
    </>
  )
}

export default UnitSettings
