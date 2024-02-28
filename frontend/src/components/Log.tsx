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
  IonLabel,
  IonIcon,
} from '@ionic/react'
import { ILogProps } from '../interfaces'
import { useRef } from 'react'
import { arrowBackOutline } from 'ionicons/icons'

const Log: React.FC<ILogProps> = ({ unit }) => {
  const modal = useRef<HTMLIonModalElement>(null)
  return (
    <>
      <IonModal trigger={`${unit.id}-log`} ref={modal}>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton
                color={'primary'}
                onClick={() => modal.current?.dismiss()}
              >
                <IonIcon icon={arrowBackOutline}></IonIcon>
              </IonButton>
            </IonButtons>
            <IonTitle>{unit.name} log</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonList>
            Last time watered:
            {unit.logs.map((log, index) => (
              <IonItem key={index}>
                <IonLabel>{log}</IonLabel>
              </IonItem>
            ))}
          </IonList>
        </IonContent>
      </IonModal>
    </>
  )
}

export default Log
