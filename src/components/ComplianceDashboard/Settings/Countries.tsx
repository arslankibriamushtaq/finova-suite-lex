import CommonTable from "../CommonTable";

const Countries = () => {
  return (
    <>
      <CommonTable
        title={"Countries List"}
        search={"Search by Name"}
        button={"add New Record"}
      />
    </>
  );
};
export default Countries;
