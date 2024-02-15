import {
  IonAlert,
  IonButton,
  IonButtons,
  IonCard,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonPage,
  IonProgressBar,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { settingsOutline } from "ionicons/icons";
import "./Home.css";
import { useEffect, useState } from "react";
import { IUnitState } from "../interfaces";
import Log from "../components/Log";
import Settings from "../components/Settings";
import unitService from "../services/units";

const Home: React.FC = () => {
  const [unit1, setUnit1] = useState<IUnitState>({
    id: "Unit 1",
    name: "Plant name",
    status: "OK",
    moistLevel: 0.5,
    moistLimit: 15000,
    waterTime: 10,
    moistMeasureIntervall: 10,
    logs: [
      "12.12.2023 12:00",
      "18.12.2023 12:00",
      "25.12.2023 12:00",
      "29.12.2023 12:00",
    ],
  });
  const [unit2, setUnit2] = useState<IUnitState>({
    id: "Unit 2",
    name: "Plant name",
    status: "ERROR",
    moistLevel: 0.1,
    moistLimit: 15000,
    waterTime: 15,
    moistMeasureIntervall: 4,
    logs: [
      "12.12.2023 12:00",
      "17.12.2023 12:00",
      "24.12.2023 12:00",
      "29.12.2023 12:00",
    ],
  });
  const [unit3, setUnit3] = useState<IUnitState>({
    id: "Unit 3",
    name: "Plant name",
    status: "OK",
    moistLevel: 0.3,
    moistLimit: 15000,
    waterTime: 20,
    moistMeasureIntervall: 7,
    logs: [
      "12.12.2023 12:00",
      "19.12.2023 12:00",
      "28.12.2023 12:00",
      "29.12.2023 12:00",
    ],
  });
  const [unit4, setUnit4] = useState<IUnitState>({
    id: "Unit 4",
    name: "Plant name",
    status: "OK",
    moistLevel: 0.9,
    moistLimit: 15000,
    waterTime: 25,
    moistMeasureIntervall: 5,
    logs: [
      "12.12.2023 12:00",
      "16.12.2023 12:00",
      "20.12.2023 12:00",
      "25.12.2023 12:00",
    ],
  });
  const units = [
    { unit: unit1, setUnit: setUnit1 },
    { unit: unit2, setUnit: setUnit2 },
    { unit: unit3, setUnit: setUnit3 },
    { unit: unit4, setUnit: setUnit4 },
  ];

  useEffect(() => {
    unitService.getAll().then((units) => console.log(units));
  }, []);

  const refresh = () => {
    unitService.getAll().then((units) => console.log(units));
  };

  const setColor = (unit: IUnitState) => {
    if (unit.moistLevel < 0.33) {
      return "danger";
    }
    if (unit.moistLevel >= 0.33 && unit.moistLevel < 0.66) {
      return "success";
    } else {
      return "primary";
    }
  };

  const waterNow = (unit: IUnitState) => {
    /* code to water */
    console.log(unit.id);
    return <></>;
  };

  return (
    <div>
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle slot="secondary">My plants</IonTitle>
            <IonButtons slot="end">
              <IonButton color={"primary"} onClick={refresh}>
                REFRESH
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {units.map((u) => (
            <IonCard key={u.unit.id}>
              <IonGrid>
                <IonRow>
                  <IonCol>
                    <p>{u.unit.id}</p>
                  </IonCol>
                  <IonCol>
                    <h3 className="align-center">{u.unit.name}</h3>
                  </IonCol>
                  <IonCol class="ion-padding-start">
                    <IonButtons class="ion-justify-content-end">
                      <IonButton id={`${u.unit.id}-settings`}>
                        <IonIcon icon={settingsOutline}></IonIcon>
                      </IonButton>
                    </IonButtons>
                    <Settings unit={u.unit} setUnit={u.setUnit} />
                  </IonCol>
                </IonRow>
                <IonRow>
                  {u.unit.status === "OK" ? (
                    <IonCol>
                      <p className="align-center">
                        Status:{" "}
                        <IonText color="success">{u.unit.status}</IonText>
                      </p>
                    </IonCol>
                  ) : (
                    <IonCol>
                      <p className="align-center">
                        Status:{" "}
                        <IonText color="danger">{u.unit.status}</IonText>
                      </p>
                    </IonCol>
                  )}
                </IonRow>
                <IonRow class="ion-justify-content-center">
                  <IonCol class="ion-align-self-end" size="auto">
                    <IonText>
                      <p style={{ textAlign: "end" }}>Moist level:</p>
                    </IonText>
                  </IonCol>
                  <IonCol size="6">
                    <p className="moist-percent">{u.unit.moistLevel * 100}%</p>
                    <IonProgressBar
                      value={u.unit.moistLevel}
                      color={setColor(u.unit)}
                    ></IonProgressBar>
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol>
                    <IonText>
                      <p className="last-time-watered">
                        Last time watered: <br /> {u.unit.logs[0]}{" "}
                      </p>
                    </IonText>
                  </IonCol>
                </IonRow>
                <IonRow class="ion-align-items-center">
                  <IonCol class="ion-text-center">
                    <IonButton
                      id={`${u.unit.id}-log`}
                      shape="round"
                      expand="block"
                      color="danger"
                    >
                      Log
                    </IonButton>
                    <Log unit={u.unit}></Log>
                  </IonCol>
                  <IonCol class="ion-text-center">
                    <IonButton
                      id={`confirm-water-${u.unit.id}`}
                      shape="round"
                      expand="block"
                      color="primary"
                    >
                      Water now
                    </IonButton>
                    <IonAlert
                      header="Confirm"
                      message={`Confirm watering for ${u.unit.name}`}
                      trigger={`confirm-water-${u.unit.id}`}
                      buttons={[
                        {
                          text: "CANCEL",
                          role: "cancel",
                          handler: () => {
                            console.log("Watering canceled " + u.unit.id);
                          },
                        },
                        {
                          text: "WATER NOW",
                          role: "confirm",
                          handler: () => {
                            waterNow(u.unit);
                            console.log("Watering confirmed " + u.unit.id);
                          },
                        },
                      ]}
                      onDidDismiss={({ detail }) =>
                        console.log(`Dismissed with role: ${detail.role}`)
                      }
                    ></IonAlert>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCard>
          ))}
        </IonContent>
      </IonPage>
    </div>
  );
};

export default Home;
