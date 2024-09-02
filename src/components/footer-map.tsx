import type { CommunityType } from '@/App'
import MyImage from '../../public/Logomarca-da-Defesa-Civil-Amazonas-01.png'
import yImage from '../../public/icone-localização-02.png'

interface FooterMapProps {
  selectedCommunity: CommunityType | null
}

export function FooterMap({ selectedCommunity }: FooterMapProps) {
  return (
    <div className="px-4 bg-blue-950 rounded-xl flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4 max-w-[1300px] m-auto mt-5">
      <img
        src={MyImage}
        alt="Descrição da imagem"
        className="w-[100px] sm:w-[142px] h-auto"
      />

      <div className="bg-white text-blue-950 font-bold rounded-xl p-4 w-full max-w-[300px] sm:max-w-[400px] mx-auto">
        {selectedCommunity ? (
          <div className="flex flex-col md:flex-row md:flex-wrap md:justify-center space-y-4 md:space-x-4 md:space-y-0">
            <div className="bg-white text-blue-950 font-bold rounded-xl p-4 md:w-[300px]">
              <p>{selectedCommunity.name}</p>
            </div>
            <div className="bg-white text-blue-950 font-bold rounded-xl p-4 md:w-[300px]">
              <p>Calha: {selectedCommunity.city.riverChannel.name}</p>
            </div>
            <div className="bg-white text-blue-950 font-bold rounded-xl p-4 md:w-[300px]">
              <p>
                Quantidade de Domicílios:{' '}
                {selectedCommunity.quantitativeResidence}
              </p>
            </div>
            <div className="bg-white text-blue-950 font-bold rounded-xl p-4 md:w-[300px]">
              <p>População: {selectedCommunity.quantitativePopulation}</p>
            </div>
          </div>
        ) : (
          <>
            <p>Quantidade Total de Municípios: 62</p>
            <p>Quantidade Total de Comunidades: 4.557</p>
            <p>Quantidade Total de Domicílios: 149.434</p>
            <p>Quantidade Total da População: 581.670</p>
            <p>Média de Famílias: 145.418</p>
          </>
        )}
      </div>

      <img
        src={yImage}
        alt="Descrição da imagem"
        className="w-[200px] sm:w-[270px] h-auto"
      />
    </div>
  )
}
