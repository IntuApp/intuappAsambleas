import CustomInput from "@/components/basics/CustomInput";
import { colombiaCities } from "@/lib/colombiaCities";
import CustomText from "../basics/CustomText";
import CustomSelect from "../basics/CustomSelect";

export default function EntityBasicDataStep({
  entityForm,
  setEntityForm,
  entityTypes,
}) {
  return (
    <div className="max-w-[1128px] max-h-[517px] w-full h-full bg-[#FFFFFF] border border-[#F3F6F9] rounded-3xl p-6 flex flex-col gap-5" >
      <CustomText variant="bodyX" className="text-[#0E3C42] font-bold">
        1. Datos de la Entidad
      </CustomText>
      <CustomText variant="bodyL" className="text-[#333333] font-regular">
        Ingrese los detalles básicos de la unidad privada:
      </CustomText>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <CustomInput
          label="Nombre de la entidad"
          variant="labelM"
          className="max-w-[344px] max-h-[80px]"
          classLabel="text-[#333333] font-bold"
          classInput="max-w-[344px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
          value={entityForm.name ? entityForm.name : ""}
          onChange={(e) =>
            setEntityForm({ ...entityForm, name: e.target.value })
          }
          placeholder="Escribe aquí el nombre"
        />

        <CustomInput
          label="Nit"
          variant="labelM"
          optional
          className="max-w-[344px] max-h-[80px] "
          classLabel="text-[#333333] font-bold"
          classInput="max-w-[344px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
          value={entityForm.nit}
          onChange={(e) =>
            setEntityForm({ ...entityForm, nit: e.target.value })
          }
          placeholder="Escribe aquí el Nit"
        />
        <CustomSelect
          label="Tipo de entidad "
          variant="labelM"
          className="max-w-[344px] max-h-[80px]"
          classLabel="text-[#333333] font-bold"
          classSelect="text-[#838383] font-normal border-[#D3DAE0] "
          value={entityForm.type}
          onChange={(e) =>
            setEntityForm({ ...entityForm, type: e.target.value })
          }
        >
          <option value="">Selecciona aquí el tipo de unidad</option>
          {entityTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </CustomSelect>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <CustomSelect
          label="Ciudad"
          variant="labelM"
          optional
          className="max-w-[344px] max-h-[80px]"
          classLabel="text-[#333333] font-bold"
          classSelect="text-[#838383] font-normal border-[#D3DAE0] "
          value={entityForm.city}
          onChange={(e) =>
            setEntityForm({ ...entityForm, city: e.target.value })
          }
        >
          <option value="">Selecciona aquí la ciudad</option>
          {colombiaCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </CustomSelect>
        <CustomInput
          label="Dirección"
          variant="labelM"
          className="max-w-[344px] max-h-[80px]"
          classLabel="text-[#333333] font-bold"
          classInput="max-w-[344px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
          value={entityForm.address}
          onChange={(e) =>
            setEntityForm({ ...entityForm, address: e.target.value })
          }
          placeholder="Escribe aquí la dirección"
        />
      </div>
      <div className="rounded-t border border-[#D3DAE0]"></div>
      <CustomText variant="bodyL" className="text-[#333333] font-regular">
        Ingrese los detalles básicos del administrador o funcionario de la
        entidad:
      </CustomText>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <CustomInput
          label="Nombre"
          variant="labelM"
          optional
          className="max-w-[344px] max-h-[80px]"
          classLabel="text-[#333333] font-bold"
          classInput="max-w-[344px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
          value={entityForm.adminName}
          onChange={(e) =>
            setEntityForm({ ...entityForm, adminName: e.target.value })
          }
          placeholder="Escribe aquí el nombre"
        />
        <CustomInput
          label="Correo"
          variant="labelM"
          optional
          className="max-w-[344px] max-h-[80px]"
          classLabel="text-[#333333] font-bold"
          classInput="max-w-[344px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
          value={entityForm.adminEmail}
          onChange={(e) =>
            setEntityForm({ ...entityForm, adminEmail: e.target.value })
          }
          placeholder="Escribe aquí el correo"
        />
        <CustomInput
          label="Número de celular"
          variant="labelM"
          optional
          className="max-w-[344px] max-h-[80px]"
          classLabel="text-[#333333] font-bold"
          classInput="max-w-[344px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
          value={entityForm.adminPhone}
          onChange={(e) =>
            setEntityForm({ ...entityForm, adminPhone: e.target.value })
          }
          placeholder="Escribe aquí el número"
        />
      </div>
    </div>
  );
}
