import { useState, useEffect, useRef } from 'react'
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api'
import { api } from './api/axios'
import { FooterMap } from './components/footer-map'
import { FilterSelect } from './components/select-filter'

const mapContainerStyle = {
  height: '60vh',
  width: '100%',
}
const defaultCenter = { lat: -4.08488, lng: -63.1417 }
const defaultZoom = 6.2

export type CommunityType = {
  id: string
  name: string
  lat: number
  long: number
  cityId: string
  quantitativePopulation: string
  quantitativeResidence: string
  city: {
    ibgeCode: string
    name: string
    riverChannel: {
      name: string
    }
  }
}

type CityType = {
  id: string
  name: string
  riverChannelId: string
  riverChannel: {
    id: string
    name: string
  }
}

type RiverChannel = {
  id: string
  name: string
}

const MapComponent = () => {
  const [data, setData] = useState<CommunityType[]>([])
  const [cities, setCities] = useState<CityType[]>([])
  const [riverChannels, setRiverChannels] = useState<RiverChannel[]>([])
  const [filteredCities, setFilteredCities] = useState<CityType[]>([])
  const [filteredData, setFilteredData] = useState<CommunityType[]>([])
  const [filterRiverChannel, setFilterRiverChannel] = useState<string>('')
  const [filterCity, setFilterCity] = useState<string>('')
  const [filterCommunity, setFilterCommunity] = useState<string>('')
  const [mapCenter, setMapCenter] = useState(defaultCenter)
  const [mapZoom, setMapZoom] = useState(defaultZoom)
  const [selectedCommunity, setSelectedCommunity] =
    useState<CommunityType | null>(null)
  const [hoveredCommunity, setHoveredCommunity] =
    useState<CommunityType | null>(null)

  const mapRef = useRef<google.maps.Map | null>(null)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDBElssAOFSt_pv9_4yjTxEE1eZs-CBIqY' || '',
  })

  useEffect(() => {
    fetchCommunities()
    fetchCities()
  }, [])

  const fetchCommunities = async () => {
    try {
      const response = await api.get('/public/community/list')
      setData(response.data)
      setFilteredData(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  const fetchCities = async () => {
    try {
      const response = await api.get('/cities')
      const cityData = response.data.city.map((city: CityType) => ({
        id: city.id,
        name: city.name,
        riverChannelId: city.riverChannelId,
        riverChannel: {
          id: city.riverChannel.id,
          name: city.riverChannel.name,
        },
      }))
      setCities(cityData)
      setFilteredCities(cityData)

      const uniqueRiverChannels = Array.from(
        new Set(cityData.map((city: CityType) => city.riverChannelId)),
      ).map((id) => {
        const city = cityData.find(
          (city: CityType) => city.riverChannelId === id,
        )
        return {
          id: city?.riverChannelId || '',
          name: city?.riverChannel.name || 'Nome não disponível',
        }
      })

      setRiverChannels(uniqueRiverChannels)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    applyFilters()
  }, [filterRiverChannel, filterCity, filterCommunity])

  const handleRiverChannelChange = (value: string) => {
    if (value === 'todos') {
      setFilterRiverChannel('')
      setFilterCity('')
      setFilterCommunity('')
    } else {
      setFilterRiverChannel(value)
      setFilterCity('')
      setFilterCommunity('')
    }
  }

  const handleCityChange = (value: string) => {
    if (value === 'todos') {
      setFilterCity('')
      setFilterCommunity('')
    } else {
      setFilterCity(value)
      setFilterCommunity('')
    }
  }

  const handleCommunityChange = (value: string) => {
    if (value === 'todos') {
      setFilterCommunity('')
    } else {
      setFilterCommunity(value)
    }
  }

  const applyFilters = () => {
    let filteredCommunities = data

    if (filterRiverChannel) {
      const citiesFilteredByRiverChannel = cities.filter(
        (city) => city.riverChannelId === filterRiverChannel,
      )
      setFilteredCities(citiesFilteredByRiverChannel)
      filteredCommunities = filteredCommunities.filter((item) =>
        citiesFilteredByRiverChannel.some((city) => city.id === item.cityId),
      )
      if (filteredCommunities.length > 0) {
        setMapCenter({
          lat: filteredCommunities[0].lat,
          lng: filteredCommunities[0].long,
        })
        setMapZoom(6.5)
      }
    } else {
      setFilteredCities(cities)
    }

    if (filterCity) {
      filteredCommunities = filteredCommunities.filter(
        (item) => item.cityId === filterCity,
      )
      if (filteredCommunities.length > 0) {
        setMapCenter({
          lat: filteredCommunities[0].lat,
          lng: filteredCommunities[0].long,
        })
        setMapZoom(8)
      }
    }

    if (filterCommunity) {
      filteredCommunities = filteredCommunities.filter(
        (item) => item.id === filterCommunity,
      )
      if (filteredCommunities.length > 0) {
        setMapCenter({
          lat: filteredCommunities[0].lat,
          lng: filteredCommunities[0].long,
        })
        setMapZoom(10)
      }
    }

    if (!filterRiverChannel && !filterCity && !filterCommunity) {
      filteredCommunities = data
      setMapCenter(defaultCenter)
      setMapZoom(defaultZoom)
    }

    setFilteredData(filteredCommunities)
  }

  if (loadError) return <div>Error loading map</div>
  if (!isLoaded) return <div>Loading...</div>

  return (
    <div className="rounded-md h-screen font-bold">
      <div className="flex mx-auto w-full justify-center flex-col max-w-[1300px]">
        <div className="w-full items-center flex justify-between flex-wrap">
          <FilterSelect
            label="Selecione a calha:"
            options={riverChannels}
            value={filterRiverChannel}
            onValueChange={handleRiverChannelChange}
          />
          <FilterSelect
            label="Selecione o município:"
            options={filteredCities}
            value={filterCity}
            onValueChange={handleCityChange}
          />
          <FilterSelect
            label="Selecione a comunidade:"
            options={filteredData.filter((item) => item.cityId === filterCity)}
            value={filterCommunity}
            onValueChange={handleCommunityChange}
          />
        </div>

        <div className="flex items-center justify-center mt-9">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={mapZoom}
            center={mapCenter}
            onLoad={(map) => {
              mapRef.current = map
            }}
          >
            {filteredData.map((item) => (
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
                <p>
                  <strong>Município:</strong> {hoveredCommunity.city.name}
                </p>
                <p>
                  <strong>Código IBGE:</strong> {hoveredCommunity.city.ibgeCode}
                </p>
                <p>
                  <strong>Latitude:</strong> {hoveredCommunity.lat}
                </p>
                <p>
                  <strong>Longitude:</strong> {hoveredCommunity.long}
                </p>
                <p>
                  <strong>Quantidade de Domicílios:</strong>{' '}
                  {hoveredCommunity.quantitativeResidence}
                </p>
                <p>
                  <strong>População:</strong>{' '}
                  {hoveredCommunity.quantitativePopulation}
                </p>
              </div>
            )}
          </GoogleMap>
        </div>
      </div>

      <FooterMap selectedCommunity={selectedCommunity} />
    </div>
  )
}

export default MapComponent
