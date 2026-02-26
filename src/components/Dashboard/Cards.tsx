
const Cards = (props: any) => {
  return (
    <div className="col-xl-3 col-sm-12 col-lg-4 col-md-6">
      <div className="card card-flex">
        <img src={props.icon} alt={props.title} />
        <div className="card-body w-100">
          <div className="card-title h-auto" style={{ fontSize: "12px" }}>
            {props.title}
          </div>
          <p className="card-text" style={{ fontSize: "12px" }}>
            {props.value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cards;
