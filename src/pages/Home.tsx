import { IonButton, IonButtons, IonCard, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';
import { useState } from 'react';

class Unit {
  id: string
  name: string
  moistLimit: number
  waterTime: number
  moistMeasureIntervall: number
  constructor(id: string, name: string, moistLimit: number, waterTime: number, moistMeasureIntervall: number) {
    this.id = id;
    this.name = name
    this.moistLimit = moistLimit
    this.waterTime = waterTime
    this.moistMeasureIntervall = moistMeasureIntervall
  }
}

const Home: React.FC = () => {

  const [units, setUnits] = useState([
    {uni: "", name: "" }
  ])

  
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
        <IonCard>
          
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Home;
