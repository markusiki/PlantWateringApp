import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonList, IonItem, IonLabel } from "@ionic/react"
import {ILogProps } from "../interfaces"
import { useRef } from "react";


const Log: React.FC<ILogProps> = ({ unit }) => {

  const modal = useRef<HTMLIonModalElement>(null);
  return (
    <>
      <IonModal trigger={unit.id} ref={modal}>
        <IonHeader>
          <IonToolbar>
            <IonTitle slot="secondary">{unit.name} log</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => modal.current?.dismiss()}>Close</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonList>
            {unit.logs.map((log, index) =>
              <IonItem key={index}>
                <IonLabel>
                  {log}
                </IonLabel>
              </IonItem>
            )}
          </IonList>
        </IonContent>
      </IonModal>
    </>
    )
}

export default Log