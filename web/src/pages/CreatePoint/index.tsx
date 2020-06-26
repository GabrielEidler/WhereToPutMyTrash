import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react';
import {FiArrowLeft} from 'react-icons/fi';
import axios from 'axios';

//styles
import './styles.css'
import logo from '../../assets/logo.svg';

//components
import {Link,useHistory} from 'react-router-dom';
import { Map, TileLayer, Marker } from "react-leaflet";
import { LeafletMouseEvent } from "leaflet";

//apis
import api from '../../services/api';

const CreatePoint = () => {

    // useState accepts a typescript parameter: and the [] represents that
    // is an array of said interface
    const [initialPos, setinitialPos] = useState<[number, number]>([0,0]);
    const [items, setItems] = useState<Item[]>([]);
    const [selectedItems, setSelectedItems] = useState<number[]>([])
    const [ufs, setUfs] = useState<string[]>([]);
    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [cities, setCities] = useState<string[]>([]);
    const [mapPos, setMapPos] = useState<[number, number]>([0,0]);
    const [formData, setformData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    })
    interface Item {
        title: string,
        id: number,
        image_url: string
    }

    interface IBGEUFResponse {
        sigla: string
    }

    interface IBGECityResponse {
        nome: string
    }

    const history = useHistory();

    useEffect(() => {
        //initialize initial map pos marker
        navigator.geolocation.getCurrentPosition(position => {
            const {latitude, longitude} =  position.coords;
            setinitialPos([latitude,longitude]);
        })
    }, [])

    useEffect(() => {
        // here we will put the data from the database that won't change
        // so there's no need to update it more than once
        // ( I suspect that a reload from the api might cause that)
        // ps: react doesn't let you use async in useEffect
        api.get('items').then(res =>{
            setItems(res.data);
        })
    }, [])

    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
        .then(res=>{
            const ufInitials = res.data.map(uf => uf.sigla);

            setUfs(ufInitials);
        })

    }, [])
    
    useEffect(() => {
        //reload whenever the users changes the UF
        if(selectedUf === '0')
        {
            return;
        }
 
        axios
        .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
        .then(res=>{    
            const cityNames = res.data.map(city => city.nome)
            setCities(cityNames);
        })
        

    }, [selectedUf])

    // saves selected uf
    const ufHandler = (event:ChangeEvent<HTMLSelectElement>) => {
       const uf = event.target.value;
        setSelectedUf(uf);
    }

    //saves user selected city
    const cityHandler = (event:ChangeEvent<HTMLSelectElement>) => {
        const city = event.target.value;
         setSelectedCity(city);
     }

     //saves users selected map point
     const mapHandler = (event:LeafletMouseEvent) => {
        setMapPos([event.latlng.lat, event.latlng.lng]);

     }

     // saves users input to send to the server
     const inputHandler = (event:ChangeEvent<HTMLInputElement>) => {
     //console.log(event.target.name, event.target.value)
     const {name, value} = event.target;
     // [name] correspondes the name of each one of them, so it can either be email, name or whatsapp
     setformData({
         ...formData,
         [name]: value
     });
     }

     //filter users selected items
     const itemHandler = (id: number) => {
        const alreadySelected = selectedItems.findIndex(item => item === id);

        //removes previously selected id
        const filteredItems = selectedItems.filter(item => item !== id);

        if(alreadySelected >= 0){
            setSelectedItems(filteredItems);
        }else{
            setSelectedItems([...selectedItems, id])
        }
     }

     // grabs all the data written by the user and register it in our backend server
     const submitHandler = async (event:FormEvent) => {
        event.preventDefault();

        const { name, email, whatsapp } = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = mapPos;
        const items = selectedItems;

        const data = {
            name,
            whatsapp,
            email,
            uf,
            city,
            latitude,
            longitude,
            items
        }
        await api.post('points', data);

        history.push('/');
     }


    return(
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to="/">
                    < FiArrowLeft /> Voltar para home 
                </Link>
            </header>
            <form onSubmit={submitHandler}>
                <h1>Cadastro do <br></br> ponto de coleta</h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                            <label htmlFor="name">Nome da entidade</label>
                            <input 
                            type="text"
                            name="name"
                            id="name"
                            onChange={inputHandler}
                            />
                    </div>

                    <div className="field-group">
                        <div className="field">
                                <label htmlFor="email">E-mail</label>
                                <input 
                                type="email"
                                name="email"
                                id="email"
                                onChange={inputHandler}
                                />
                        </div>
                        <div className="field">
                                <label htmlFor="whatsapp">Whatsapp</label>
                                <input 
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={inputHandler}
                                />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereços</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>
                    <Map center={initialPos} zoom={15} onClick={mapHandler}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker 
                            position={mapPos}
                        />
                    </Map>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select 
                                name="uf" 
                                id="uf" 
                                value={selectedUf} 
                                onChange={ufHandler}
                            >
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                )
                                )}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                            name="city" 
                            id="city"
                            onChange={cityHandler}
                            >
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                )
                                )}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {
                        items.map(item => 
                        (
                            <li 
                            key={item.id} 
                            onClick={() => itemHandler(item.id)}
                            className={selectedItems.includes(item.id) ? 'selected' : ''}
                            >
                                <img src={item.image_url} alt="item"/>
                                <span>{item.title}</span>
                            </li>
                        )
                        
                        )}
                    </ul>
                </fieldset>
                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    );
}




export default CreatePoint;