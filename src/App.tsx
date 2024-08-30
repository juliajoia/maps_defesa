import { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api';
import { api } from './api/axios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import MyImage from '/public/Logomarca-da-Defesa-Civil-Amazonas-01.png'
import yImage from '/public/icone-localização-02.png'


const mapContainerStyle = {
  height: '60vh',
  width: '100%',
};
const defaultCenter = { lat: -4.08488, lng: -63.1417 };
const defaultZoom = 6.2;

type CommunityType = {
  id: string;
  name: string;
  lat: number;
  long: number;
  cityId: string;
  quantitativePopulation: string;
  quantitativeResidence: string;
  city: {
    ibgeCode: string;
    name: string;
    riverChannel: {
      name: string;
    };
  };
};

type CityType = {
  id: string;
  name: string;
  riverChannelId: string;
};

type RiverChannel = {
  id: string;
  name: string;
};

const MapComponent = () => {
  const [data, setData] = useState<CommunityType[]>([]);
  const [cities, setCities] = useState<CityType[]>([]);
  const [riverChannels, setRiverChannels] = useState<RiverChannel[]>([]);
  const [filteredCities, setFilteredCities] = useState<CityType[]>([]);
  const [filteredData, setFilteredData] = useState<CommunityType[]>([]);
  const [filterRiverChannel, setFilterRiverChannel] = useState<string>('');
  const [filterCity, setFilterCity] = useState<string>('');
  const [filterCommunity, setFilterCommunity] = useState<string>('');
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(defaultZoom);
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityType | null>(null);
  const [hoveredCommunity, setHoveredCommunity] = useState<CommunityType | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);


  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDBElssAOFSt_pv9_4yjTxEE1eZs-CBIqY' || '',
  });

  useEffect(() => {
    fetchCommunities();
    fetchCities();
  }, []);


  const fetchCommunities = async () => {
    try {
      const response = await api.get("/public/community/list");
      setData(response.data);
      setFilteredData(response.data); 
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCities = async () => {
    try {
        const response = await api.get("/cities");
        console.log("Resposta da API de cidades:", response.data);
        const cityData = response.data.city.map((city: CityType) => ({
            id: city.id,
            name: city.name,
            riverChannelId: city.riverChannelId
        }));
        setCities(cityData);

        const uniqueRiverChannels = Array.from(new Set(cityData.map((city: any) => city.riverChannelId)))
            .map(id => {
                const city = cityData.find((city: any) => city.riverChannelId === id);
                return {
                    id: city?.riverChannelId || '',
                    name: city?.riverChannelId || 'Nome não disponível'
                };
            });

        setRiverChannels(uniqueRiverChannels);
    } catch (error) {
        console.log(error);
    }
};


  useEffect(() => {
    applyFilters();
  }, [filterRiverChannel, filterCity, filterCommunity]);

  const handleRiverChannelChange = (value: string) => {
    console.log("River Channel selected:", value);
    setFilterRiverChannel(value);
    setFilterCity('');
    setFilterCommunity('');
  };
  
  const handleCityChange = (value: string) => {
    console.log("City selected:", value);
    setFilterCity(value);
    setFilterCommunity('');
  };
  
  const handleCommunityChange = (value: string) => {
    console.log("Community selected:", value)
    setFilterCommunity(value)
;
  };
  
  const applyFilters = () => {
    let filteredCommunities = data;
  
    if (filterRiverChannel) {
      const citiesFilteredByRiverChannel = cities.filter(city => city.riverChannelId === filterRiverChannel);
      setFilteredCities(citiesFilteredByRiverChannel);
      filteredCommunities = filteredCommunities.filter(item =>
        citiesFilteredByRiverChannel.some(city => city.id === item.cityId)
      );
      if (filteredCommunities.length > 0) {
        setMapCenter({ lat: filteredCommunities[0].lat, lng: filteredCommunities[0].long });
        setMapZoom(6.5);
      }
    }
  
    if (filterCity) {
      filteredCommunities = filteredCommunities.filter(item => item.cityId === filterCity);
      if (filteredCommunities.length > 0) {
        setMapCenter({ lat: filteredCommunities[0].lat, lng: filteredCommunities[0].long });
        setMapZoom(8);
      }
    }
  
    if (filterCommunity) {
      filteredCommunities = filteredCommunities.filter(item => item.id === filterCommunity);
      if (filteredCommunities.length > 0) {
        setMapCenter({ lat: filteredCommunities[0].lat, lng: filteredCommunities[0].long });
        setMapZoom(10);
      }
    }
  
    if (!filterRiverChannel) {
      setFilteredCities(cities);
    }
  
    if (!filterCity) {
      setFilteredData(data);
    }
  
    setFilteredData(filteredCommunities);
  };
  if (loadError) return <div>Error loading map</div>;
  if (!isLoaded) return <div>Loading...</div>;



  return (
    <div className='rounded-md h-screen font-bold'>
      <div className='flex mx-auto w-full justify-center flex-col max-w-[1300px]'>
        <div className='w-full items-center flex justify-between'>
          <div className='bg-blue-900 rounded-xl mt-3 p-2 w-[230px] select-bg-white'>
            <h2 className='uppercase font-bold text-xs text-gray-100'>selecione a calha:</h2>
            <Select onValueChange={handleRiverChannelChange} value={filterRiverChannel}>
              <SelectTrigger className="text-gray-100 bg-blue-950 font-bold text-sm rounded-xl border-none">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
              <SelectItem className='bg-white' value="light">Todos</SelectItem>
                {riverChannels.map(riverChannel => (
                  <SelectItem className='bg-white' key={riverChannel.id} value={riverChannel.id}>
                    {riverChannel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='bg-blue-900 rounded-xl mt-3 p-2 w-[230px]'>
            <h2 className='uppercase font-bold text-xs text-gray-100'>selecione o município:</h2>
            <Select onValueChange={handleCityChange} value={filterCity}>
              <SelectTrigger className="text-gray-100 bg-blue-950 font-bold text-sm rounded-xl border-none">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
              <SelectItem className='bg-white' value="light">Todos</SelectItem>
                {filteredCities.map(city => (
                  <SelectItem className='bg-white' key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='bg-blue-900 rounded-xl mt-3 p-2 w-[230px] select-bg-white'>
            <h2 className='uppercase font-bold text-xs text-gray-100'>selecione a comunidade:</h2>
            <Select onValueChange={handleCommunityChange} value={filterCommunity}>
              <SelectTrigger className="text-gray-100 bg-blue-950 font-bold text-sm rounded-xl border-none">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
              <SelectItem className='bg-white' value="light">Todos</SelectItem>
                {filteredData.filter(item => item.cityId === filterCity)
                  .map(item => (
                    <SelectItem className='bg-white' key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='flex items-center justify-center mt-9'>
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={mapZoom}
            center={mapCenter}
            onLoad={(map) => {
              mapRef.current = map;
            }}
          >
            {filteredData.map(item => (
              <Marker
                key={item.id}
                position={{ lat: item.lat, lng: item.long }}
                onMouseOver={() => setHoveredCommunity(item)}
                onMouseOut={() => setHoveredCommunity(null)}
              />
            ))}

            {hoveredCommunity && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '50px',
                  left: '200px',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'white',
                  padding: '10px',
                  borderRadius: '5px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  zIndex: 100,
                }}
              >
                <h2 className="text-lg font-bold">{hoveredCommunity.name}</h2>
        <p><strong>Município:</strong> {hoveredCommunity.city.name}</p>
        <p><strong>Código IBGE:</strong> {hoveredCommunity.city.ibgeCode}</p>
        <p><strong>Latitude:</strong> {hoveredCommunity.lat}</p>
        <p><strong>Longitude:</strong> {hoveredCommunity.long}</p>
        <p><strong>Quantidade de Domicílios:</strong> {hoveredCommunity.quantitativeResidence}</p>
        <p><strong>População:</strong> {hoveredCommunity.quantitativePopulation}</p>
      </div>
            )}
          </GoogleMap>
        </div>
      </div>

        <div className='fixed w-[1300px] bg-blue-950 rounded-xl m-0 p-20 bottom-14 right-[300px]'></div>

        {selectedCommunity !== null && (
          <div className='fixed rounded-xl left-[335px] m-64 p-2 text-blue-950 font-bold bg-white bottom-[-110px] w-[350px]'>
            <p>{selectedCommunity.name}</p>
          </div>
        )}
        {selectedCommunity !== null && (
          <div className='fixed rounded-xl left-[400px] m-48 p-2 text-blue-950 font-bold bg-white bottom-[-110px] w-[350px]'>
            <p>Calha: {selectedCommunity.city.riverChannel.name}</p>
          </div>
        )}
        {selectedCommunity !== null && (
          <div className='fixed right-[335px] rounded-xl m-64 p-2 text-blue-950 font-bold bg-white bottom-[-110px] w-[350px]'>
            <p>Quantidade de Domicílios: {selectedCommunity.quantitativeResidence}</p>
          </div>
        )}
        {selectedCommunity !== null && (
          <div className='fixed right-[400px] rounded-xl m-48 p-2 text-blue-950 font-bold bg-white bottom-[-110px] w-[350px]'>
            <p>População: {selectedCommunity.quantitativePopulation}</p>
          </div>
        )}
        {selectedCommunity === null && (
          <div className='fixed rounded-xl inset-x-0 mx-auto p-2 text-blue-950 font-bold bg-white bottom-[70px] w-[330px]'>
            <p>Quantidade Total de Municípios: 62</p>
            <p>Quantidade Total de Comunidades: 4.557</p>
            <p>Quantidade Total de Domicílios: 149.434</p>
            <p>Quantidade Total da População: 581.670</p>
            <p>Média de Famílias: 145.418</p>
          </div>
        )}

        <div className='rounded-md h-screen font-bold'>
          <img 
            src={MyImage} 
            alt="Descrição da imagem" 
            style={{ 
              position: 'fixed', 
              bottom: '65px', 
              right: '360px', 
              width: '142px', 
              height: 'auto' 
            }} 
          />
          <div className='fixed mx-auto flex-col w-[250px]'></div>
        </div>
        <img 
          src={yImage} 
          alt="Descrição da imagem" 
          style={{ 
            position: 'fixed', 
            bottom: '50px', 
            left: '310px', 
            width: '270px', 
            height: 'auto' 
          }} 
        />
      </div>
  );
};

export default MapComponent;
