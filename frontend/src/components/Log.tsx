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
  IonRow,
  IonCol,
  IonGrid,
  IonListHeader,
  useIonAlert,
} from '@ionic/react'
import { ILogProps } from '../interfaces'
import { useRef } from 'react'
import { arrowBackOutline, trashOutline } from 'ionicons/icons'
import './Log.css'

const Log: React.FC<ILogProps> = ({ unit, deleteLogs }) => {
  const modal = useRef<HTMLIonModalElement>(null)
  const [presentAlert] = useIonAlert()

  const handleDelete = (event: React.MouseEvent) => {
    presentAlert({
      header: 'Confirm',
      message: `Are you sure that you want to delete all ${unit.name} logs?`,
      buttons: [
        {
          text: 'CANCEL',
          role: 'cancel',
          handler: () => {
            modal.current?.dismiss()
          },
        },
        {
          text: 'CONFIRM',
          role: 'confirm',
          handler: () => {
            deleteLogs(event, unit.id)
            modal.current?.dismiss()
          },
        },
      ],
    })
    modal.current?.dismiss()
  }
  return (
    <>
      <IonModal trigger={`${unit.id}-log`} ref={modal}>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton color={'primary'} onClick={() => modal.current?.dismiss()}>
                <IonIcon icon={arrowBackOutline}></IonIcon>
              </IonButton>
            </IonButtons>
            <IonTitle class="ion-text-center">{unit.name} logs</IonTitle>
            <IonButtons slot="end">
              <IonButton color={'danger'} onClick={handleDelete}>
                <IonIcon icon={trashOutline}></IonIcon>
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonList>
            <IonGrid>
              <IonRow className="log">
                <IonCol size="3.1">
                  <IonListHeader>
                    <IonLabel>Date</IonLabel>
                  </IonListHeader>
                </IonCol>
                <IonCol size="1.9">
                  <IonListHeader>
                    <IonLabel>Moist Value</IonLabel>
                  </IonListHeader>
                </IonCol>
                <IonCol size="2">
                  <IonListHeader>
                    <IonLabel>Status</IonLabel>
                  </IonListHeader>
                </IonCol>
                <IonCol size="1.5">
                  <IonListHeader>
                    <IonLabel>Watered</IonLabel>
                  </IonListHeader>
                </IonCol>
                <IonCol size="3.5">
                  <IonListHeader>
                    <IonLabel>Watering Method</IonLabel>
                  </IonListHeader>
                </IonCol>
              </IonRow>
              {unit.logs.map((log, index) => (
                <IonRow key={index} className="log">
                  <IonCol size="3.1">
                    <IonItem lines="none">
                      <IonLabel>{log.date}</IonLabel>
                    </IonItem>
                  </IonCol>
                  <IonCol size="1.9">
                    <IonItem lines="none">
                      <IonLabel>{log.moistValue}</IonLabel>
                    </IonItem>
                  </IonCol>
                  <IonCol size="2">
                    <IonItem lines="none">
                      <IonLabel>{log.status}</IonLabel>
                    </IonItem>
                  </IonCol>
                  {log.watered ? (
                    <>
                      <IonCol size="1.5">
                        <IonItem lines="none">
                          <IonLabel>Yes</IonLabel>
                        </IonItem>
                      </IonCol>
                      <IonCol size="3.5">
                        <IonItem lines="none">
                          <IonLabel>{log.waterMethod}</IonLabel>
                        </IonItem>
                      </IonCol>
                    </>
                  ) : (
                    <IonCol size="1.5">
                      <IonItem lines="none">
                        <IonLabel>No</IonLabel>
                      </IonItem>
                    </IonCol>
                  )}
                </IonRow>
              ))}
            </IonGrid>
          </IonList>
        </IonContent>
      </IonModal>
    </>
  )
}

export default Log
