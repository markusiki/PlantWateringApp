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
} from "@ionic/react";
import { ISettingsProps, ISettingsState } from "../interfaces";
import { useEffect, useRef, useState } from "react";

const Settings: React.FC<ISettingsProps> = ({ unit, setUnit }) => {
  const [settings, setSettings] = useState<ISettingsState>({
    name: "",
    moistLimit: 0,
    waterTime: 0,
    moistMeasureIntervall: 0,
  });
  const modal = useRef<HTMLIonModalElement>(null);

  useEffect(() => {
    setSettings({
      name: unit.name,
      moistLimit: unit.moistLimit,
      waterTime: unit.waterTime,
      moistMeasureIntervall: unit.moistMeasureIntervall,
    });
  }, [unit.moistLimit, unit.moistMeasureIntervall, unit.name, unit.waterTime]);

  const confirm = () => {
    setUnit({
      ...unit,
      name: settings.name,
      moistLimit: settings.moistLimit,
      waterTime: settings.waterTime,
      moistMeasureIntervall: settings.moistMeasureIntervall,
    });
    modal.current?.dismiss();
  };

  const handleChange = (event: any) => {
    setSettings({ ...settings, [event.target.name]: event.target.value });
  };

  return (
    <>
      <IonModal trigger={`${unit.id}-settings`} ref={modal}>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={() => modal.current?.dismiss()}>
                Cancel
              </IonButton>
            </IonButtons>
            <IonTitle slot="secondary">Settings</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={confirm}>Confirm</IonButton>
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
                onIonChange={handleChange}
                type="text"
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Set moisture level limit"
                value={settings.moistLimit}
                name="moistLimit"
                labelPlacement="stacked"
                onIonChange={handleChange}
                type="number"
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Set watering time in seconds"
                value={settings.waterTime}
                name="waterTime"
                labelPlacement="stacked"
                onIonChange={handleChange}
                type="number"
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Set moisture measure intervall (days)"
                value={settings.moistMeasureIntervall}
                name="moistMeasureIntervall"
                labelPlacement="stacked"
                onIonChange={handleChange}
                type="number"
              />
            </IonItem>
          </IonList>
        </IonContent>
      </IonModal>
    </>
  );
};

export default Settings;
