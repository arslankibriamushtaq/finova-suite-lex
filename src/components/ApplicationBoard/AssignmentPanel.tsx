import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import { getUserList, assignDepartment } from '../../redux/apis/apisCrud';
import toast from 'react-hot-toast';

const AssignmentPanel = ({
  dept,
  selectedApplication,
}: any) => {
  const [assignDeptId, setAssignDeptId] = useState<string>('');
  const [assignees, setAssignees] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!assignDeptId) return;
    (async () => {
      try {
        const res = await getUserList(assignDeptId);
        setAssignees(res.data.data || []);
      } catch {}
    })();
  }, [assignDeptId]);
  const handleSave = async () => {
    if (!assignDeptId || !selectedUserId || !selectedApplication) return;
    try {
      const body = {
        app_id: selectedApplication.id,
        department_id: assignDeptId,
        //comment,
        user_id: '1',
        assignee_id: Number(selectedUserId) ? Number(selectedUserId) : 1,
        comment_status: false,
        assignee_status: true,
        loan_application_number: selectedApplication.loan_application_number,
      } as any;
      const res = await assignDepartment(body);
      if (res?.data?.success || res?.data?.status === 'success') {
        toast.success(res?.data?.message || 'Assigned successfully');
      } else {
        toast.error(res?.data?.message || 'Assignment failed');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Assignment failed');
    }
  };

  return (
    <div className="assignment-panel">
      <div className="form-row">
        <label className="ap-label">Department</label>
        <Select
          value={assignDeptId}
          onChange={(value) => setAssignDeptId(value)}
          className="ap-select"
          placeholder="Select Department"
        >
          {dept?.map((d: any) => (
            <Select.Option key={d.id} value={String(d.id)}>{d.name}</Select.Option>
          ))}
        </Select>
      </div>
      <div className="form-row">
        <label className="ap-label">Assignee</label>
        <Select
          value={selectedUserId}
          onChange={(value) => setSelectedUserId(String(value))}
          className="ap-select"
          placeholder="Select User"
        >
          {assignees.map((u: any) => (
            <Select.Option key={u.id} value={String(u.id)}>{u.name || u.email || u.username}</Select.Option>
          ))}
        </Select>
      </div>
      <div className="ap-actions">
        <button className="theme-btn-next" onClick={handleSave}>Save</button>
      </div>
    </div>
  );
};

export default AssignmentPanel;


