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
  IonItemGroup,
} from '@ionic/react'
import { IUnitSettingsProps, IUnitSettingsState } from '../interfaces'
import { useEffect, useRef, useState } from 'react'
import './UnitSettings.css'

const UnitSettings: React.FC<IUnitSettingsProps> = ({ unit, handleUnitChange, handleUnitCalibration }) => {
  const [settings, setSettings] = useState<IUnitSettingsState>({
    name: '',
    moistLimit: 0,
    waterTime: 0,
    enableAutoWatering: false,
    enableMaxWaterInterval: false,
    enableMinWaterInterval: false,
    maxWaterInterval: 0,
    minWaterInterval: 0,
    waterFlowRate: '',
  })

  const modal = useRef<HTMLIonModalElement>(null)
  const [presentAlert] = useIonAlert()

  useEffect(() => {
    setSettings({
      name: unit.name,
      moistLimit: unit.moistLimit,
      waterTime: unit.waterTime,
      enableAutoWatering: unit.enableAutoWatering,
      enableMaxWaterInterval: unit.enableMaxWaterInterval,
      enableMinWaterInterval: unit.enableMinWaterInterval,
      maxWaterInterval: unit.maxWaterInterval,
      minWaterInterval: unit.minWaterInterval,
      waterFlowRate: unit.waterFlowRate.toString(),
    })
  }, [
    unit.enableAutoWatering,
    unit.enableMaxWaterInterval,
    unit.enableMinWaterInterval,
    unit.maxWaterInterval,
    unit.minWaterInterval,
    unit.moistLimit,
    unit.name,
    unit.waterTime,
    unit.waterFlowRate,
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
    if (settings.moistLimit < 0 || settings.moistLimit > 100) {
      presentAlert({
        header: 'Invalid input',
        message: 'Moisture level limit must be between 0 and 100!',
        buttons: ['Dismiss'],
      })
      return false
    }
    if (settings.waterTime < 0 || settings.waterTime > 600) {
      presentAlert({
        header: 'Invalid input',
        message: 'Water time must be between 0 and 600!',
        buttons: ['Dismiss'],
      })
      return false
    }
    if (!parseFloat(settings.waterFlowRate)) {
      presentAlert({
        header: 'Invalid input',
        message: 'Water flow rate must be a number!',
        buttons: ['Dismiss'],
      })
      return false
    } else {
      if (parseFloat(settings.waterFlowRate) < 0 || parseFloat(settings.waterFlowRate) > 0.25) {
        presentAlert({
          header: 'Invalid input',
          message: 'Water flow rate must between 0 and 0.25',
          buttons: ['Dismiss'],
        })
        return false
      }
    }
    if (settings.waterFlowRate.length > 5) {
      presentAlert({
        header: 'Invalid input',
        message: 'Water flow rate can have max 3 decimals!',
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
    if (
      settings.enableMaxWaterInterval &&
      settings.enableMinWaterInterval &&
      settings.minWaterInterval > settings.maxWaterInterval
    ) {
      presentAlert({
        header: 'Invalid input',
        message: 'Minimun water interval must be shorter than maximum watering interval!',
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
      const settingsToSave = { ...settings, waterFlowRate: parseFloat(settings.waterFlowRate) }
      handleUnitChange(event, settingsToSave, unit.id)
      modal.current?.dismiss()
    }
  }

  const handleChange = (event: any) => {
    if (event.target.name === 'name' || event.target.name === 'waterFlowRate') {
      setSettings({ ...settings, [event.target.name]: event.target.value })
    } else if (event.target.localName === 'ion-checkbox') {
      setSettings({ ...settings, [event.target.name]: event.detail.checked })
    } else {
      setSettings({ ...settings, [event.target.name]: parseInt(event.target.value) })
    }
  }

  const calibrateUnit = (event: React.MouseEvent<HTMLIonButtonElement, MouseEvent>) => {
    presentAlert({
      header: 'Calibrate wet moist value',
      message:
        "Place unit's moisture sensor in a very wet soil, let it settle for a couple of seconds, and click calibrate.",
      cssClass: 'calibration-alert',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Calibrate',
          role: 'confirm',
          handler: async () => await handleUnitCalibration(event, unit.id, 'wetMoistValue'),
        },
      ],
    })
    presentAlert({
      header: 'Calibrate dry moist value',
      message: "Place unit's moisture sensor in a very dry soil, and click calibrate.",
      cssClass: 'calibration-alert',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Calibrate',
          role: 'confirm',
          handler: async () => await handleUnitCalibration(event, unit.id, 'dryMoistValue'),
        },
      ],
    })
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
                label="Moisture level limit"
                value={settings.moistLimit}
                name="moistLimit"
                labelPlacement="stacked"
                type="number"
                helperText="Set moisture level limit value between 0 (dry) and 100 (wet)."
                min={0}
                max={100}
                onInput={handleChange}
              >
                <IonButton
                  fill="clear"
                  slot="end"
                  onClick={() => setSettings({ ...settings, moistLimit: unit.moistValue })}
                >
                  Set current moisture level
                </IonButton>
              </IonInput>
            </IonItem>

            <IonItem>
              <IonInput
                label="Watering time"
                value={settings.waterTime}
                name="waterTime"
                labelPlacement="stacked"
                type="number"
                helperText="Set watering time in seconds (0 - 600)"
                min={0}
                max={600}
                onInput={handleChange}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Water flow rate"
                value={settings.waterFlowRate}
                name="waterFlowRate"
                labelPlacement="stacked"
                type="number"
                helperText="Set water flow rate in l/s (e.g 0.105)"
                onInput={handleChange}
              />
            </IonItem>
            <IonItem>
              <IonCheckbox
                justify="space-between"
                checked={settings.enableAutoWatering}
                name="enableAutoWatering"
                onIonChange={handleChange}
              >
                Enable automatic watering
              </IonCheckbox>
            </IonItem>
            {settings.enableAutoWatering ? (
              <IonItemGroup>
                <IonItem>
                  <IonCheckbox
                    justify="space-between"
                    checked={settings.enableMinWaterInterval}
                    name="enableMinWaterInterval"
                    onIonChange={handleChange}
                  >
                    Enable minimum watering interval
                  </IonCheckbox>
                </IonItem>
                {settings.enableMinWaterInterval ? (
                  <IonItem hidden={!settings.enableMinWaterInterval}>
                    <IonInput
                      label="Set minimum watering interval (days)"
                      value={settings.minWaterInterval}
                      name="minWaterInterval"
                      labelPlacement="stacked"
                      type="number"
                      helperText="After how many days the plant will be watered,
                      even if the moisture level has not dropped under the moisture level limit."
                      min={1}
                      max={180}
                      onInput={handleChange}
                    />
                  </IonItem>
                ) : null}
                <IonItem>
                  <IonCheckbox
                    justify="space-between"
                    checked={settings.enableMaxWaterInterval}
                    name="enableMaxWaterInterval"
                    onIonChange={handleChange}
                  >
                    Enable maximum watering interval
                  </IonCheckbox>
                </IonItem>
                {settings.enableMaxWaterInterval ? (
                  <IonItem>
                    <IonInput
                      label="Set maximum watering interval (days)"
                      value={settings.maxWaterInterval}
                      name="maxWaterInterval"
                      labelPlacement="stacked"
                      onInput={handleChange}
                      type="number"
                      helperText="For how many days the plant will not be watered,
                    even if the moisture level drops under the moisture level limit."
                      min={1}
                      max={180}
                    />
                  </IonItem>
                ) : null}
              </IonItemGroup>
            ) : null}
          </IonList>

          <IonButton onClick={calibrateUnit}>Calibrate unit</IonButton>
        </IonContent>
      </IonModal>
    </>
  )
}

export default UnitSettings
