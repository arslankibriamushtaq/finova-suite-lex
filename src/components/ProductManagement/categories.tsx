import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import TableView from "../TableView/TableView";
import toast from "react-hot-toast";
import { Checkbox } from "antd";
import { getProductCategorie, getProductCategories, updateProductCategory } from "../../redux/apis/apisCrud";
import { usePermissions, PRODUCT_CATEGORIES_PERMISSIONS } from "../../hooks/useProductPermissions";

const Categories = () => {
  const { t } = useTranslation("productManagement2");
  const { hasPermission } = usePermissions();
  const canEditCategory = hasPermission(PRODUCT_CATEGORIES_PERMISSIONS.EDIT);
  const [categoriesData, setCategoriesData] = useState<any>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const productId = searchParams.get("id");

  const Categories_Header = [
    {
      name: t("common:name"),
      selector: (row: { name: any }) => row.name,

      sortable: true,
    },
    {
      name: t("categories.slug"),
      selector: (row: { slug: any }) => row.slug,

      sortable: true,
    },
    {
      name: t("categories.affiliation"),
      cell: (row: any) => (
        <Checkbox
          checked={row.affiliation}
          disabled={!canEditCategory}
          onChange={(e) => handleAffiliationChange(row.id, e.target.checked)}
        />
      ),
      width: "150px",
    },
  ];

  const handleAffiliationChange = (categoryId: any, checked: boolean) => {
    setCategoriesData((prevData: any) =>
      prevData.map((item: any) =>
        item.id === categoryId ? { ...item, affiliation: checked } : item
      )
    );
  };

  const handleUpdateCategories = async () => {
    try {
      // Get the first selected category ID (assuming only one can be selected)
      const selectedCategory = categoriesData.find((category: any) => category.affiliation);
      
      if (!selectedCategory) {
        toast.error(t("categories.selectAtLeastOne"));
        return;
      }

      const updateData = {
        category_id: selectedCategory.id.toString()
      };


      const response = await updateProductCategory(productId, updateData);
      
      if (response?.data?.message === "success") {
        toast.success(t("categories.updated"));
        // Optionally refresh the data
        fetchCategories();
      } else {
        toast.error(response?.data?.message || t("categories.updateFailed"));
      }

    } catch (error: any) {
      toast.error(error?.message || t("categories.updateFailed"));
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      
      const response = await getProductCategorie(productId);
      
      if (response?.data?.message === "success") {
        const activeCategories = response?.data?.data?.active_categories || [];
        // Add affiliation field (default to false) since API doesn't provide it
        const categoriesWithAffiliation = activeCategories.map((category: any) => ({
          ...category,
          affiliation: false // Default to false, will be updated when user toggles
        }));
        setCategoriesData(categoriesWithAffiliation);
        toast.success(t("categories.fetched"));
      } else {
        toast.error(response?.data?.message || t("categories.fetchFailed"));
      }

      setCategoriesLoading(false);

    } catch (error: any) {
      toast.error(error?.message || t("categories.fetchFailed"));
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchCategories();
    }
  }, [productId]);

  return (
    <div className="service">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>{t("categories.title")}</h4>
      </div>
      <TableView
        header={Categories_Header}
        data={categoriesData}
        totalRows={categoriesData.length}
        isLoading={categoriesLoading}
        from={1}
        page={1}
        totalPage={1}
        setPage={() => {}}
        pageSize={categoriesData.length}
        setPageSize={() => {}}
        to={categoriesData.length}
        paginationShow={false}
      />
      <div className="d-flex justify-content-end mt-3">
        {canEditCategory && (
        <button
          className="btn btn-danger"
          onClick={handleUpdateCategories}
        >
          {t("common:update")}
        </button>
        )}
      </div>
    </div>
  );
};

export default Categories;