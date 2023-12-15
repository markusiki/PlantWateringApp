import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import { settingsOutline } from 'ionicons/icons'
import './Home.css';
import { useState } from 'react';
import { IUnitState } from '../interfaces';


const Home: React.FC = () => {

  const [unit1, setUnit1] = useState<IUnitState>({ id: "Unit 1", name: "Plant name", status: "OK", moistLevel: 50, moistLimit: 15000, waterTime: 10, moistMeasureIntervall: 604800 })
  const [unit2, setUnit2] = useState<IUnitState>({ id: "Unit 2", name: "Plant name", status: "OK", moistLevel: 50, moistLimit: 15000, waterTime: 10, moistMeasureIntervall: 604800 })
  const [unit3, setUnit3] = useState<IUnitState>({ id: "Unit 3", name: "Plant name", status: "OK", moistLevel: 50, moistLimit: 15000, waterTime: 10, moistMeasureIntervall: 604800 })
  const [unit4, setUnit4] = useState<IUnitState>({ id: "Unit 4", name: "Plant name", status: "OK", moistLevel: 50, moistLimit: 15000, waterTime: 10, moistMeasureIntervall: 604800 })
  const units = [unit1, unit2, unit3, unit4]
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle slot='secondary'>My plants</IonTitle>
          <IonButtons slot='end'>
            <IonButton color={"primary"}>REFRESH</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {units.map(unit => 
          <IonCard>
            <IonGrid>
              <IonRow>
                <IonCol size='2'><p>{unit.id}</p></IonCol>
                <IonCol size='8'><h2 className='align-center'>{unit.name}</h2></IonCol>
                <IonCol size='2'>
                  <IonButtons>
                    <IonButton>
                      <IonIcon icon={settingsOutline}></IonIcon>
                    </IonButton>
                  </IonButtons>
                </IonCol>
              </IonRow>
            </IonGrid>
            <IonCardContent>
              <IonGrid>
                <IonRow class="ion-justify-content-center">
                  <IonCol><p className='align-center'>Status: {unit.status}</p></IonCol>
                </IonRow>
              </IonGrid>

            </IonCardContent>
            
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
