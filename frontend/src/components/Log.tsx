import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon,
  IonRow,
  IonCol,
  IonGrid,
  useIonAlert,
  IonLabel,
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

  const headers = ['Date', 'Moist Value', 'Unit Status', 'Watered', 'Watering Method', 'Message']
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
            <IonTitle className="ion-text-center">{unit.name} logs</IonTitle>
            <IonButtons slot="end">
              <IonButton data-testid="deleteLogs-button" color={'danger'} onClick={handleDelete}>
                <IonIcon icon={trashOutline}></IonIcon>
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonGrid>
            <div>
              <IonRow className="log-header">
                {headers.map((header, index) => (
                  <IonCol key={index} size="2" className="py-3">
                    <IonLabel className="log-label">{header}</IonLabel>
                  </IonCol>
                ))}
              </IonRow>
            </div>
            {unit.logs.map((log, index) => (
              <IonRow key={index} className="log-list">
                <IonCol className="justify-center" size="2">
                  <p className="log-item">{log.date}</p>
                </IonCol>
                <IonCol className="justify-center" size="2">
                  <p className="log-item">{log.moistValue}</p>
                </IonCol>
                <IonCol size="2" className="justify-center">
                  <p className="log-item">{log.status}</p>
                </IonCol>
                <IonCol size="2" className="justify-center">
                  {log.watered ? <p className="log-item">Yes</p> : <p className="log-item">No</p>}
                </IonCol>
                <IonCol size="2" className="justify-center">
                  {log.waterMethod ? <p className="log-item">{log.waterMethod}</p> : null}
                </IonCol>
                <IonCol size="2" className="justify-center">
                  {log.message ? <p className="log-item">{log.message}</p> : null}
                </IonCol>
              </IonRow>
            ))}
          </IonGrid>
        </IonContent>
      </IonModal>
    </>
  )
}

export default Log
