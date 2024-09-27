import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonText,
  IonButtons,
  IonMenuToggle,
} from '@ionic/react'
import { settingsOutline, logOutOutline, closeOutline } from 'ionicons/icons'
import DeviceSettings from './DeviceSettings'
import { IMenuProps } from '../interfaces'

const Menu: React.FC<IMenuProps> = ({ deviceSettings, handleDeviceSettingsChange, handleLogout }) => {
  return (
    <IonMenu contentId="main-content">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Menu</IonTitle>
          <IonButtons slot="end">
            <IonMenuToggle>
              <IonButton>
                <IonIcon icon={closeOutline}></IonIcon>
              </IonButton>
            </IonMenuToggle>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonButton className="ion-margin-bottom" expand="block" color="secondary" id="settings">
          Device Settings
          <IonIcon slot="end" icon={settingsOutline}></IonIcon>
        </IonButton>
        <DeviceSettings deviceSettings={deviceSettings} handleDeviceSettingsChange={handleDeviceSettingsChange} />
        <IonButton expand="block" color="light" onClick={handleLogout}>
          <IonText color="danger">Log Out</IonText>
          <IonIcon slot="end" icon={logOutOutline}></IonIcon>
        </IonButton>
      </IonContent>
    </IonMenu>
  )
}

export default Menu
