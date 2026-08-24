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
  IonAlert,
  IonSelect,
  IonSelectOption
} from '@ionic/react'
import { IUnitSettingsProps, IUnitSettingsState } from '../interfaces'
import { useEffect, useRef, useState } from 'react'
import './UnitSettings.css'
import UnitCalibration from './UnitCalibration'

const UnitSettings: React.FC<IUnitSettingsProps> = ({
  unit,
  handleUnitChange,
  handleUnitCalibration,
  handleClearWaterCounter,
  deviceSettings
}) => {
  const [settings, setSettings] = useState<IUnitSettingsState>({
    id: '',
    name: '',
    moistLimit: 0,
    waterTime: 0,
    waterAmount: 0,
    enableAutoWatering: false,
    enableMaxWaterInterval: false,
    enableMinWaterInterval: false,
    maxWaterInterval: 0,
    minWaterInterval: 0,
    waterFlowRate: '',
    wateringMode: 'time'
  })
  const [isCalibrating, setIsCalibrating] = useState(false)
  const unitSettingsModal = useRef<HTMLIonModalElement>(null)
  const [presentAlert] = useIonAlert()

  useEffect(() => {
    if (!unitSettingsModal.current?.isOpen) {
      setSettings({
        id: unit.id,
        name: unit.name,
        moistLimit: unit.moistLimit,
        waterTime: unit.waterTime,
        waterAmount: unit.waterAmount,
        enableAutoWatering: unit.enableAutoWatering,
        enableMaxWaterInterval: unit.enableMaxWaterInterval,
        enableMinWaterInterval: unit.enableMinWaterInterval,
        maxWaterInterval: unit.maxWaterInterval,
        minWaterInterval: unit.minWaterInterval,
        waterFlowRate: unit.waterFlowRate.toString(),
        wateringMode: unit.wateringMode
      })
    }
  }, [unit])

  const validateInputs = (settings: IUnitSettingsState) => {
    if (settings.name.length > 100 || settings.name.length < 1) {
      presentAlert({
        header: 'Invalid input',
        message: 'Plant name must be between 1 and 100 characters!',
        buttons: ['Dismiss']
      })
      return false
    }
    if (settings.moistLimit < 0 || settings.moistLimit > 100) {
      presentAlert({
        header: 'Invalid input',
        message: 'Moisture level limit must be between 0 and 100!',
        buttons: ['Dismiss']
      })
      return false
    }

    if (settings.waterTime < 0 || settings.waterTime > 600) {
      presentAlert({
        header: 'Invalid input',
        message:
          settings.wateringMode === 'time' ? 'Water time must be between 0 and 600!' : 'Too big watering amount!',
        buttons: ['Dismiss']
      })
      return false
    }
    if (!deviceSettings.useFlowSensor) {
      if (!parseFloat(settings.waterFlowRate)) {
        presentAlert({
          header: 'Invalid input',
          message: 'Water flow rate must be a number!',
          buttons: ['Dismiss']
        })
        return false
      } else {
        if (parseFloat(settings.waterFlowRate) < 0 || parseFloat(settings.waterFlowRate) > 2) {
          presentAlert({
            header: 'Invalid input',
            message: 'Water flow rate must between 0 and 2',
            buttons: ['Dismiss']
          })
          return false
        }
      }
      if (settings.waterFlowRate.length > 5) {
        presentAlert({
          header: 'Invalid input',
          message: 'Water flow rate can have max 3 decimals!',
          buttons: ['Dismiss']
        })
        return false
      }
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
        buttons: ['Dismiss']
      })
      return false
    }
    if (
      settings.enableMaxWaterInterval &&
      settings.enableMinWaterInterval &&
      settings.minWaterInterval <= settings.maxWaterInterval
    ) {
      presentAlert({
        header: 'Invalid input',
        message: 'Minimun water interval must be longer than maximum watering interval!',
        buttons: ['Dismiss']
      })
      return false
    } else {
      return true
    }
  }

  const syncWaterTimeAndAmount = () => {
    if (parseFloat(settings.waterFlowRate) > 0) {
      if (settings.wateringMode === 'amount') {
        return { ...settings, waterTime: settings.waterAmount / parseFloat(settings.waterFlowRate) }
      } else {
        return { ...settings, waterAmount: settings.waterTime * parseFloat(settings.waterFlowRate) }
      }
    }
    return settings
  }

  const confirm = (event: React.MouseEvent) => {
    const syncedSettings = syncWaterTimeAndAmount()
    const validInputs = validateInputs(syncedSettings)
    if (validInputs) {
      const settingsToSave = { ...syncedSettings, waterFlowRate: parseFloat(settings.waterFlowRate) }
      handleUnitChange(event, settingsToSave)
      unitSettingsModal.current?.dismiss()
    }
  }

  const handleCancel = () => {
    unitSettingsModal.current?.dismiss()
  }

  const handleChange = (event: any) => {
    if (event.target.name === 'name' || event.target.name === 'waterFlowRate' || event.target.name === 'wateringMode') {
      setSettings({ ...settings, [event.target.name]: event.target.value })
    } else if (event.target.localName === 'ion-checkbox') {
      setSettings({ ...settings, [event.target.name]: event.detail.checked })
    } else if (event.target.name === 'waterAmount') {
      const newWaterAmount = parseFloat(event.target.value)
      setSettings({
        ...settings,
        waterAmount: newWaterAmount,
        waterTime: newWaterAmount / parseFloat(settings.waterFlowRate)
      })
    } else if (event.target.name === 'waterTime') {
      const newWaterTime = parseFloat(event.target.value)
      setSettings({
        ...settings,
        waterTime: newWaterTime,
        waterAmount: newWaterTime * parseFloat(settings.waterFlowRate)
      })
    } else {
      setSettings({ ...settings, [event.target.name]: parseInt(event.target.value) })
    }
  }

  return (
    <>
      <IonModal
        trigger={`${unit.id}-settings`}
        ref={unitSettingsModal}
        onDidPresent={() => (unitSettingsModal.current!.isOpen = true)}
        onDidDismiss={() => (unitSettingsModal.current!.isOpen = false)}
      >
        <IonHeader>
          <IonToolbar>
            <IonButtons>
              <IonButton onClick={handleCancel}>Cancel</IonButton>
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
                disabled={deviceSettings.useFlowSensor}
                label="Water flow rate"
                value={settings.waterFlowRate}
                name="waterFlowRate"
                labelPlacement="stacked"
                type="number"
                helperText={
                  !deviceSettings.useFlowSensor
                    ? 'Set water flow rate in l/s (e.g 0.105)'
                    : 'Set automatically by water flow sensor.'
                }
                onInput={handleChange}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Watering time or amount"
                value={settings.wateringMode === 'time' ? settings.waterTime : settings.waterAmount}
                name={settings.wateringMode === 'time' ? 'waterTime' : 'waterAmount'}
                labelPlacement="stacked"
                type="number"
                helperText={
                  settings.wateringMode === 'time'
                    ? 'Set watering time in seconds (0 - 600)'
                    : 'Set watering amount in liters (0 - 600)'
                }
                min={0}
                max={600}
                onInput={handleChange}
              >
                <IonSelect
                  slot="end"
                  aria-label="Watering Unit"
                  name="wateringMode"
                  value={settings.wateringMode}
                  interface="popover"
                  onIonChange={handleChange}
                >
                  <IonSelectOption value="time">Seconds</IonSelectOption>
                  <IonSelectOption value="amount">Liters</IonSelectOption>
                </IonSelect>
              </IonInput>
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
          <IonButton onClick={() => setIsCalibrating(true)}>Calibrate Unit</IonButton>
          <UnitCalibration
            isCalibrating={isCalibrating}
            setIsCalibrating={setIsCalibrating}
            unit={unit}
            handleUnitCalibration={handleUnitCalibration}
          ></UnitCalibration>
          <IonButton id="clear-water-counter" color={'warning'}>
            Clear water counter
          </IonButton>
          <IonAlert
            header="Confirm"
            message={`Are you sure that you want to clear water counter?`}
            trigger={'clear-water-counter'}
            buttons={[
              {
                text: 'CANCEL',
                role: 'cancel'
              },
              {
                text: 'CLEAR COUNTER',
                role: 'confirm',
                handler: () => {
                  handleClearWaterCounter(unit.id)
                  unitSettingsModal.current?.dismiss()
                }
              }
            ]}
          ></IonAlert>
        </IonContent>
      </IonModal>
    </>
  )
}

export default UnitSettings
