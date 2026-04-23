import { Form } from 'react-router-dom';
import { FormInput, FileInput, DateInput, NumberInput } from '../';
import { formatDate } from '../../utils';

const PlacementModal = ({ modalData }) => {
  const { action, placement, onCampus, applicationId } = modalData;
  return (
    <dialog id="placementModal" className="modal modal-bottom sm:modal-middle backdrop-blur-sm">
      <div className="modal-box bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl max-w-2xl">
        <div className="mb-8">
          <h3 className="text-2xl font-black text-white tracking-tight capitalize">
            {action} <span className="text-indigo-400">Placement</span>
          </h3>
          <p className="text-slate-400 text-sm mt-1">Provide details about your placement offer.</p>
        </div>

        <Form
          method="POST"
          className="space-y-6"
          name="placementForm"
          encType="multipart/form-data"
        >
          {action === 'update' && (
            <input
              type="text"
              name="placementId"
              defaultValue={placement?._id}
              hidden
            />
          )}

          <div className="grid sm:grid-cols-2 gap-6">
            {onCampus ? (
              <input
                type="text"
                defaultValue={applicationId}
                name="applicationId"
                hidden
              />
            ) : (
              <>
                <FormInput
                  label="Job Profile"
                  name="jobProfile"
                  type="text"
                  defaultValue={placement?.jobProfile}
                  placeholder="e.g. Software Engineer"
                />
                <FormInput
                  label="Company Name"
                  name="company"
                  type="text"
                  defaultValue={placement?.company}
                  placeholder="e.g. Google"
                />
                <FormInput
                  label="Location"
                  name="location"
                  type="text"
                  defaultValue={placement?.location}
                  placeholder="e.g. Bangalore"
                />
                <NumberInput
                  label="Package (LPA)"
                  name="package"
                  defaultValue={placement?.package}
                  placeholder="e.g. 12"
                />
              </>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <FileInput
              label="Offer Letter"
              name="offerLetter"
              accept="application/pdf"
              isRequired={true}
            />
            <FileInput
              label="Joining Letter"
              name="joiningLetter"
              accept="application/pdf"
            />
          </div>

          <div className="w-fit">
            <DateInput
              label="Joining Date"
              name="joiningDate"
              defaultValue={
                placement?.joiningDate &&
                formatDate(new Date(placement?.joiningDate))
              }
              isRequired={false}
            />
          </div>

          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic pt-2 border-t border-white/5">
            * All fields are required unless marked otherwise
          </p>

          <div id="placementFormError" className="text-red-500 text-sm font-medium"></div>

          <div className="flex justify-end gap-4">
            <form method="dialog">
              <button className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold transition-all">
                Cancel
              </button>
            </form>
            <button
              type="submit"
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
              name="intent"
              value={`${action}Placement`}
            >
              {action === 'create' ? 'Add Placement' : 'Update Placement'}
            </button>
          </div>
        </Form>
      </div>
    </dialog>
  );
};
export default PlacementModal;
