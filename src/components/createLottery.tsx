'use client'

import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Checkbox} from "@/components/ui/checkbox";
import {Plus} from "lucide-react";
import {ScrollArea} from "@/components/ui/scroll-area";
import {ChangeEvent, useState} from "react";
import {Label} from "@/components/ui/label";
import {CheckedState} from "@radix-ui/react-checkbox";
import {createPoolTx} from "@/lib/contracts";
import {AppDispatch, useAppSelector} from "@/store";
import {getPasskeyKeypair, suiClient} from "@/configs/networkConfig";
import {useDispatch} from "react-redux";
import {refreshPoolInfos, setNavTab, setProgressValue} from "@/store/modules/info";
import {randomTwentyFive} from "@/lib/utils";

// ------ basic info ------
const formSchemaObj = {
    Name: z.string().min(1, {
        message: "Name is required."
    }).max(20, {
        message: "Name is no more than 20 characters."
    }),
    Description: z.string().min(1, {
        message: "Description is required."
    }).max(100, {
        message: "Description is no more than 100 characters."
    }),
    Winners: z.coerce.number().gte(1, {
        message: "Winners are required."
    }),
    "Minimum Amount": z.coerce.number().gte(1, {
        message: "Minimum Amount is required."
    }),
    "Repeat Award": z.boolean().default(false).optional(),
};

const formSchema = z.object(formSchemaObj)
    .refine(obj => obj["Repeat Award"] || obj["Minimum Amount"] >= obj.Winners, {
        message: "`Minimum` >= `Winners` or `Repeat Award`", path: ["Minimum Amount"]
    })
;

// ------ fields that require user to fill in ------
type FieldType = {
    field: string,
    encryption: boolean
}

type FieldsType = {
    0: FieldType,
    1: FieldType,
    2: FieldType,
    3: FieldType,
    4: FieldType,
}

const initialFields: FieldsType = {
    0: {
        field: "",
        encryption: false,
    },
    1: {
        field: "",
        encryption: false,
    },
    2: {
        field: "",
        encryption: false,
    },
    3: {
        field: "",
        encryption: false,
    },
    4: {
        field: "",
        encryption: false,
    }
}

export default function CreateLottery() {
    // open dialog or not
    const [open, setOpen] = useState<boolean>(false);

    // basic info
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            Name: "",
            Description: "",
            Winners: 1,
            "Minimum Amount": 1,
            "Repeat Award": false
        }
    });

    // fields that require user to fill in
    const [fieldCount, setFieldCount] = useState<number>(0);
    const [fields, setFields] = useState<FieldsType>(initialFields);

    const renderFields = () => {
        const handleChangeInput = (e: ChangeEvent<HTMLInputElement>, index: number) => {
            const oldField = fields[index.toString() as "0" | "1" | "2" | "3" | "4"];
            setFields({
                ...fields,
                [index]: {
                    field: e.target.value,
                    encryption: oldField.encryption
                }
            });
        }
        const handleCheckedChange = (state: CheckedState, index: number) => {
            const oldField = fields[index.toString() as "0" | "1" | "2" | "3" | "4"];
            setFields({
                ...fields,
                [index]: {
                    field: oldField.field,
                    encryption: state
                }
            });
        }
        return (
            <>
                {
                    Array(fieldCount).fill(null).map((_, index) => {
                        return (
                            <div className="flex flex-col gap-2 items-start" key={index}>
                                <div className="flex flex-col gap-2 items-start">
                                    <Label>{`Info Field ${index + 1}`}</Label>
                                    <Input placeholder="Field Name" size={36} maxLength={20} onChange={(e) => handleChangeInput(e, index)} />
                                </div>
                                <div className="flex gap-3 items-start">
                                    <Label>{`Encrypt Info ${index + 1}`}</Label>
                                    <Checkbox className="cursor-pointer" onCheckedChange={(state => handleCheckedChange(state, index))} />
                                </div>
                            </div>
                        );
                    })
                }
            </>
        );
    }

    // transaction
    const account = useAppSelector(state => state.info.address);
    const publicKeyStr = useAppSelector(state => state.info.publicKeyStr);
    const dispatch = useDispatch<AppDispatch>();
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!account || !publicKeyStr)
            return;
        dispatch(setProgressValue(0));
        try {
            const curTime = new Date().getTime().toString();
            const fieldsArray = [fields["0"], fields["1"], fields["2"], fields["3"], fields["4"]].filter(field => field.field.length > 0);
            const tx = createPoolTx({
                name: values.Name,
                description: values.Description,
                creationTime: curTime,
                minimumParticipants: values["Minimum Amount"],
                numberOfWinners: values.Winners,
                allowsMultipleAwards: values["Repeat Award"] ? values["Repeat Award"] : false,
                fields: fieldsArray.map(field => field.field),
                encryption: fieldsArray.map(field => field.encryption),
                sender: account
            });
            const keypair = getPasskeyKeypair(window.location.hostname, publicKeyStr);
            const res = await suiClient.signAndExecuteTransaction({
                transaction: tx,
                signer: keypair
            });
            dispatch(setProgressValue(randomTwentyFive()));
            await suiClient.waitForTransaction({
                digest: res.digest
            });
            dispatch(refreshPoolInfos());
            let basicValue = 25;
            const intervalTimer = setInterval(() => {
                const targetValue = basicValue === 75 ? 100 : basicValue + randomTwentyFive();
                basicValue += 25;
                dispatch(setProgressValue(targetValue));
                if (targetValue >= 100) {
                    dispatch(setNavTab("Main"));
                    setOpen(false);
                    clearInterval(intervalTimer);
                }
            }, 1000);
        } catch (e) {
            console.error(e);
            dispatch(setProgressValue(100));
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="default" className="cursor-pointer">Create Lottery</Button>
            </DialogTrigger>
            <DialogContent className="h-[45rem] overflow-y-scroll">
                <Form {...form}>
                    <DialogHeader>
                        <DialogTitle>Create Lottery</DialogTitle>
                        <DialogDescription>
                            You will serve as the initial administrator, creating a brand new draw.
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 items-center">
                        <FormField
                            control={form.control}
                            name="Name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Name" {...field} size={36} />
                                    </FormControl>
                                    <FormDescription>
                                        This is the name of the lottery pool.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="Description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Description" {...field} size={36} />
                                    </FormControl>
                                    <FormDescription>
                                        This is the description of the lottery pool.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="Winners"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Winners</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Number Of Winners" {...field} size={36} />
                                    </FormControl>
                                    <FormDescription>
                                        This is the final number of winners.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="Minimum Amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Minimum Amount</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Minimum Number Of Participants" {...field} size={36} />
                                    </FormControl>
                                    <FormDescription>
                                        This is the minimum number of participants.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="Repeat Award"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex gap-3 items-center">
                                        <FormLabel>Repeat Award</FormLabel>
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="cursor-pointer" />
                                        </FormControl>
                                    </div>
                                    <FormDescription className="w-76">
                                        Is it allowed for the same person to win the award repeatedly?
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {
                            renderFields()
                        }
                        {
                            fieldCount > 0 &&
                            <Label className="text-xs text-[#737373] -mt-3">If you no longer need some fields, leave them empty.</Label>
                        }
                        {
                            fieldCount >= 0 && fieldCount < 5 &&
                            <Plus size={28} className="border-2 border-[#041f4b] rounded-full font-bold text-[#afb3b5] hover:text-[#35a1f7] active:text-[#196ae3] cursor-pointer"
                                  onClick={() => setFieldCount(fieldCount + 1 <= 5 ? fieldCount + 1 : 5)} />
                        }
                        <DialogFooter className="self-end items-center">
                            <Button variant="default" type="submit" className="cursor-pointer">Create</Button>
                        </DialogFooter>
                    </form>
                    </ScrollArea>
                </Form>
            </DialogContent>
        </Dialog>
    );
}