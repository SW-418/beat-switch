import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react";

function SelectableDropdown<T extends string | number>(props: SelectableDropdownProps<T>) {
    return (
        <div className="w-32 pb-2">
            <Listbox value={props.selected} onChange={props.setSelected}>
                <ListboxButton
                className={
                    'relative block w-full rounded-lg bg-black/10 py-1.5 pr-8 pl-3 text-left text-sm/6 text-black hover:bg-black/20'
                }
                >
                {props.selected.name}
                </ListboxButton>
                <ListboxOptions
                anchor="bottom"
                transition
                className={
                    'w-[var(--button-width)] rounded-xl border border-black/10 bg-white p-1 [--anchor-gap:var(--spacing-1)]'
                }
                >
                {props.options.map((option) => (
                    <ListboxOption
                    key={option.value}
                    value={option}
                    className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-black/10"
                    >
                    <div className="text-sm/6 text-black">{option.name}</div>
                    </ListboxOption>
                ))}
                </ListboxOptions>
            </Listbox>
        </div>
    );
}


interface SelectableDropdownProps<T extends string | number> {
    options: DropdownOption<T>[];
    selected: DropdownOption<T>;
    setSelected: (selected: DropdownOption<T>) => void;
}

interface DropdownOption<T extends string | number> {
    name: string;
    value: T;
}

export { SelectableDropdown };
export type { DropdownOption, SelectableDropdownProps };
