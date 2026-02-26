import Cards from "./Cards";
import { Images } from "../Config/Images";
import { createGlobalStyle } from "styled-components";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/rootReducer";

const OverView = (props: any) => {
  const themeBuilder = useSelector((state: RootState) => state.block.theme);

  const GlobalStyle = createGlobalStyle`

  .card-blocks .row .col-md-3 .card{
    background: ${themeBuilder?.cards?.cardsBackgroundColor} !important;
    color:${themeBuilder?.cards?.cardsTextColor}!important;
  }
  `;
  return (
    <>
      <div className="card-blocks">
        <div className="row">
          {props?.cards &&
            props?.cards.map((card: any, index: any) => (
              <Cards
                key={index}
                icon={card.icon ? card.icon : Images.Distribute}
                title={card.title}
                value={card.value}
              />
            ))}
        </div>
      </div>
      <GlobalStyle />
    </>
  );
};

export default OverView;
