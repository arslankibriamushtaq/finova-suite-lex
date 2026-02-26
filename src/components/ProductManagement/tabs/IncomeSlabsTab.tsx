import { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons"
import { Button, Modal, Form, Input, Menu, Dropdown, Row, Col, Switch } from "antd"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button as UIButton } from "../../ui/button"
import TableView from "../../TableView/TableView"
import toast from "react-hot-toast"
import { getIncomeSlabByProductId, createIncomeSlab, updateIncomeSlab, deleteIncomeSlab } from "../../../redux/apis/apisCrudProductManagement"
import arrowDown from "../../../assets/images/arrow-down.png"

interface IncomeSlabsTabProps {
  formData: any
  updateFormData: (field: string, value: any) => void
  errors: Record<string, string>
  onNext: () => void
  onPrevious: () => void
  productId: string | null
}

export default function IncomeSlabsTab({
  formData,
  updateFormData,
  errors,
  onNext,
  onPrevious,
  productId,
}: IncomeSlabsTabProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalRows, setTotalRows] = useState(0)
  const [from, setFrom] = useState(0)
  const [to, setTo] = useState(0)
  const [totalPage, setTotalPage] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isViewMode, setIsViewMode] = useState(false)
  const [selectedRow, setSelectedRow] = useState<any>(null)
  const [form] = Form.useForm()

  const fetchIncomeSlabs = async () => {
    if (!productId) {
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      const response = await getIncomeSlabByProductId(productId)
      if (response?.data?.success && response?.data?.data) {
        const responseData = response.data.data
        setData(responseData.data || [])
        setTotalRows(responseData.total || 0)
        setFrom(responseData.from || 0)
        setTo(responseData.to || 0)
        setPage(responseData.current_page || page)
        setTotalPage(responseData.last_page || 1)
      }
    } catch (error: any) {
      console.error("Error fetching income slabs:", error)
      toast.error(error?.response?.data?.message || "Failed to fetch income slabs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (productId) {
      fetchIncomeSlabs()
    }
  }, [page, pageSize, productId])

  const handleAdd = () => {
    setIsEditMode(false)
    setIsViewMode(false)
    setSelectedRow(null)
    form.resetFields()
    form.setFieldsValue({
      status: true
    })
    setShowModal(true)
  }

  const handleEdit = (row: any) => {
    setIsEditMode(true)
    setIsViewMode(false)
    setSelectedRow(row)
    form.setFieldsValue({
      from_income: row.from_income,
      to_income: row.to_income,
      multiplier_percentage: row.multiplier_percentage,
      status: row.status === "active"
    })
    setShowModal(true)
  }

  const handleView = (row: any) => {
    setIsEditMode(false)
    setIsViewMode(true)
    setSelectedRow(row)
    form.setFieldsValue({
      from_income: row.from_income,
      to_income: row.to_income,
      multiplier_percentage: row.multiplier_percentage,
      status: row.status === "active"
    })
    setShowModal(true)
  }

  const handleDelete = async (row: any) => {
    try {
      const response = await deleteIncomeSlab(row.id)
      if (response?.data?.success) {
        toast.success("Income slab deleted successfully")
        fetchIncomeSlabs()
      } else {
        toast.error(response?.data?.message || "Failed to delete income slab")
      }
    } catch (error: any) {
      console.error("Error deleting income slab:", error)
      toast.error(error?.response?.data?.message || "Failed to delete income slab")
    }
  }

  const handleSubmit = async () => {
    if (!productId) {
      toast.error("Product ID not found. Please complete Basic Information step first.")
      return
    }
    
    try {
      const values = await form.validateFields()
      const payload = {
        product_id: parseInt(productId),
        from_income: parseFloat(values.from_income),
        to_income: parseFloat(values.to_income),
        multiplier_percentage: parseFloat(values.multiplier_percentage),
        status: values.status ? "active" : "inactive"
      }

      if (isEditMode && selectedRow) {
        const response = await updateIncomeSlab(selectedRow.id, payload)
        if (response?.data?.success) {
          toast.success("Income slab updated successfully")
          setShowModal(false)
          fetchIncomeSlabs()
        } else {
          toast.error(response?.data?.message || "Failed to update income slab")
        }
      } else {
        const response = await createIncomeSlab(payload)
        if (response?.data?.success) {
          toast.success("Income slab created successfully")
          setShowModal(false)
          fetchIncomeSlabs()
        } else {
          toast.error(response?.data?.message || "Failed to create income slab")
        }
      }
    } catch (error: any) {
      if (error?.errorFields) {
        // Form validation errors
        return
      }
      console.error("Error saving income slab:", error)
      toast.error(error?.response?.data?.message || "Failed to save income slab")
    }
  }

  const handleMenuClick = (action: string, row: any) => {
    switch (action) {
      case "view":
        handleView(row)
        break
      case "edit":
        handleEdit(row)
        break
      case "delete":
        Modal.confirm({
          title: "Delete Income Slab",
          content: "Are you sure you want to delete this income slab?",
          okText: "Yes",
          cancelText: "No",
          onOk: () => handleDelete(row),
        })
        break
    }
  }

  const menu = (row: any) => (
    <Menu>
      <Menu.Item
        key="view"
        icon={<EyeOutlined />}
        onClick={() => handleMenuClick("view", row)}
      >
        View
      </Menu.Item>
      <Menu.Item
        key="edit"
        icon={<EditOutlined />}
        onClick={() => handleMenuClick("edit", row)}
      >
        Edit
      </Menu.Item>
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        onClick={() => handleMenuClick("delete", row)}
        danger
      >
        Delete
      </Menu.Item>
    </Menu>
  )

  const tableHeaders = [
    {
      name: "Sr No.",
      selector: (row: any) => row.srNo,
      sortable: true,
      width: "100px",
    },
    {
      name: "From Income",
      selector: (row: any) => row.from_income || "-",
      sortable: true,
    },
    {
      name: "To Income",
      selector: (row: any) => row.to_income || "-",
      sortable: true,
    },
    {
      name: "Multiplier Percentage",
      selector: (row: any) => row.multiplier_percentage || "-",
      sortable: true,
    },
    {
      name: "Status",
      cell: (row: any) => (
        <span
          style={{
            padding: "6px 12px",
            borderRadius: "32px",
            fontSize: "12px",
            backgroundColor: row.status === "active" ? "var(--chart-2)" : "var(--destructive)",
            color: "var(--primary-foreground)",
            display: "inline-block",
            textTransform: "capitalize",
          }}
        >
          {row.status || "inactive"}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button
            className="gradient-btn bg-teal-600 text-foreground border border-primary-foreground rounded-lg py-2.5 px-5"
            type="primary"
            style={{
              borderRadius: "8px",
              padding: "10px 20px",
            }}
          >
            Select <img src={arrowDown} alt="" />
          </Button>
        </Dropdown>
      ),
    },
  ]

  const mappedData = data?.map((item: any, index: number) => ({
    id: item.id,
    srNo: (page - 1) * pageSize + index + 1,
    from_income: item.from_income,
    to_income: item.to_income,
    multiplier_percentage: item.multiplier_percentage,
    status: item.status,
  })) || []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Affordability Income Slabs</CardTitle>
              <p className="text-muted-foreground">
                Manage income slabs for product eligibility calculation.
              </p>
            </div>
            <button className="theme-btn-next" onClick={handleAdd}>
              Add New Slab
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <TableView
            header={tableHeaders}
            data={mappedData}
            totalRows={totalRows}
            isLoading={loading}
            from={from}
            page={page}
            totalPage={totalPage}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            to={to}
          />
        </CardContent>
      </Card>

      <Modal
        className="custom-mod"
        style={{ maxWidth: "640px" }}
        title={
          isViewMode
            ? "View Income Slab"
            : isEditMode
            ? "Edit Income Slab"
            : "Add New Income Slab"
        }
        open={showModal}
        onCancel={() => {
          setShowModal(false)
          form.resetFields()
        }}
        footer={[
          <Button key="close" onClick={() => {
            setShowModal(false)
            form.resetFields()
          }}>
            {isViewMode ? "Close" : "Cancel"}
          </Button>,
          !isViewMode && (
            <Button
              key="save"
              type="primary"
              onClick={handleSubmit}
            >
              {isEditMode ? "Update" : "Add"}
            </Button>
          ),
        ]}
      >
        <div className="Ente-details">
          <Form
            form={form}
            layout="vertical"
            disabled={isViewMode}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="From Income"
                  name="from_income"
                  rules={[
                    { required: true, message: "Please enter from income" },
                    {
                      validator: (_, value) => {
                        if (value && (isNaN(value) || parseFloat(value) < 0)) {
                          return Promise.reject(new Error("From income must be a number greater than or equal to 0"))
                        }
                        return Promise.resolve()
                      }
                    }
                  ]}
                >
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter from income"
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="To Income"
                  name="to_income"
                  rules={[
                    { required: true, message: "Please enter to income" },
                    {
                      validator: (_, value) => {
                        if (value && (isNaN(value) || parseFloat(value) < 0)) {
                          return Promise.reject(new Error("To income must be a number greater than or equal to 0"))
                        }
                        return Promise.resolve()
                      }
                    }
                  ]}
                >
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter to income"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Multiplier Percentage"
                  name="multiplier_percentage"
                  rules={[
                    { required: true, message: "Please enter multiplier percentage" },
                    {
                      validator: (_, value) => {
                        if (value && (isNaN(value) || parseFloat(value) < 0)) {
                          return Promise.reject(new Error("Multiplier percentage must be a number greater than or equal to 0"))
                        }
                        return Promise.resolve()
                      }
                    }
                  ]}
                >
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter multiplier percentage"
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Status"
                  name="status"
                  valuePropName="checked"
                >
                  <Switch
                    className="red-switch"
                    disabled={isViewMode}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal>

      {/* Tab Navigation */}
      <div className="flex justify-between gap-3 pt-4">
        <UIButton variant="outline" onClick={onPrevious} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Previous
        </UIButton>
        <UIButton onClick={onNext} className="gap-2">
          Next: Duration Settings
          <ArrowRight className="h-4 w-4" />
        </UIButton>
      </div>
    </div>
  )
}

