import { useLoaderData, Form, useSubmit } from 'react-router-dom';
import { SimpleFormInput, FileInput } from '../';

const StudentPersonal = () => {
  const personalDetails = useLoaderData().profileDetails?.personalDetails;
  const submit = useSubmit();

  let fatherName, motherName, contactNumber, address, dateOfBirth;

  if (personalDetails) {
    fatherName = personalDetails.fatherName;
    motherName = personalDetails.motherName;
    contactNumber = personalDetails.contactNumber;
    address = personalDetails.address;
    dateOfBirth = personalDetails.dateOfBirth
      ? new Date(personalDetails.dateOfBirth).toISOString().split('T')[0]
      : '';
  }

  const activeBacklogs = useLoaderData().profileDetails?.activeBacklogs;
  const completedBacklogs = useLoaderData().profileDetails?.completedBacklogs;

  const handlePhotoSelect = (event) => {
    if (!event.target.files?.length) return;

    const form = event.currentTarget.form;
    if (!form) return;

    const formData = new FormData(form);
    formData.set('intent', 'updatePersonalDetails');
    submit(formData, { method: 'post' });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom duration-700">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
            <h3 className="text-2xl font-black text-white tracking-tight">Personal Details</h3>
          </div>

          <Form method="POST" encType="multipart/form-data" className="flex flex-col gap-y-10">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
              <div className="lg:col-span-1">
                <FileInput
                  name="photo"
                  label="Profile Photo"
                  onChange={handlePhotoSelect}
                />
              </div>
              <SimpleFormInput
                name="fatherName"
                type="text"
                label="Father's Name"
                defaultValue={fatherName}
              />
              <SimpleFormInput
                name="motherName"
                type="text"
                label="Mother's Name"
                defaultValue={motherName}
              />
              <SimpleFormInput
                name="dateOfBirth"
                type="date"
                label="Date of Birth"
                defaultValue={dateOfBirth}
              />
              <SimpleFormInput
                name="locality"
                type="text"
                label="Locality"
                defaultValue={address?.locality}
              />
              <SimpleFormInput
                name="city"
                type="text"
                label="City"
                defaultValue={address?.city}
              />
              <SimpleFormInput
                name="pincode"
                type="text"
                label="Pin Code"
                defaultValue={address?.pincode}
              />
              <SimpleFormInput
                name="district"
                type="text"
                label="District"
                defaultValue={address?.district}
              />
              <SimpleFormInput
                name="state"
                type="text"
                label="State"
                defaultValue={address?.state}
              />
              <SimpleFormInput
                name="contactNumber"
                type="text"
                label="Contact Number"
                defaultValue={contactNumber}
              />
              <SimpleFormInput
                name="activeBacklogs"
                type="number"
                label="Active Backlogs"
                min="0"
                defaultValue={activeBacklogs ?? 0}
              />
              <SimpleFormInput
                name="completedBacklogs"
                type="number"
                label="Completed Backlogs"
                min="0"
                defaultValue={completedBacklogs ?? 0}
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-white/5">
              <button
                type="submit"
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                name="intent"
                value="updatePersonalDetails"
              >
                Save Changes
              </button>
            </div>
          </Form>
        </div>
      </div>
  );
};

export default StudentPersonal;
