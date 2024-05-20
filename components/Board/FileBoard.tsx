import { THEME_COLOR } from "@/utils/app/consts";
import { Box, Button, Flex, Group, LoadingOverlay, Progress, Text } from "@mantine/core";
import { FC, useEffect, useState } from "react";
import { Dropzone } from '@mantine/dropzone';
import { IconCheck, IconFile, IconUpload } from "@tabler/icons-react";
import { addSource, getFileExtension, getFilecontent, train } from "@/utils/app/train";
import { FaRegWindowClose } from "react-icons/fa";
import { Source, SourceState } from "@/types/train";
import Link from "next/link";
import { notifications } from "@mantine/notifications";

interface Props {
    nextStep: () => void;
    prevStep: () => void;
    brand_id: string,
    brand_name: string | string[] | undefined
}

interface AddedFiles {
    name: string,
    progress: number,
    size: string,
    state: string,
    source: Source
}

const FileBoard: FC<Props> = ({
    nextStep,
    prevStep,
    brand_id,
    brand_name
}) => {
    
    const [addedFiles, setAddedFiles] = useState<AddedFiles[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const trainFiles = async (files: File[]) => {

        try {
            let promises: Promise<any>[] = [];
        const added_files: AddedFiles[] = JSON.parse(JSON.stringify(addedFiles));

        for (let k = 0; k < files.length; k++) {
            const name = files[k].name;
            const size = (files[k].size / 1024 / 1024).toFixed(1);
            added_files.push({
                name,
                size,
                state: 'training',
                progress: 30,
                source: SourceState
            });
            promises.push(getFilecontent(files[k]));
        }

        // setAddedFiles(added_files);
        const result = await Promise.all(promises);
        // const _added_files = JSON.parse(JSON.stringify(addedFiles));
        addedFiles.map((item, key) => {
            added_files[key].progress = 30;
        })
        setAddedFiles(added_files);
        promises = [];
        for (let k = 0; k < result.length; k++) {
            const name = result[k].name;
            const text = result[k].text;
            let size = "0";
            size = added_files.filter((item: any) => item.name == name)[0]['size']
            const added_source = await addSource(
                brand_id,
                name,
                'files',
                size,
            );
            added_files.map((item: AddedFiles, key) => {
                if (item.name == name) {
                    added_files[key].source = added_source.source;
                    added_files[key].progress = 60;
                }
            })
            setAddedFiles(added_files);
            await train(text, brand_id, added_source.source.id, name, 'files');
            added_files.map((item: AddedFiles, key: number) => {
                if (item.name == name) {
                    added_files[key].progress = 100;
                    added_files[key].state = "trained";
                }
            })
            setAddedFiles(added_files);
            notifications.show({
                message: 'success',
            })
        }
        }catch(e){
            notifications.show({
                message: 'failed',
                color: 'red'
            })
        }   
    }

    const stopTraining = (index: number) => {
        const _added_files: AddedFiles[] = JSON.parse(JSON.stringify(addedFiles));
        const source_id = _added_files[index].source.id;
        setAddedFiles(p => p.splice(index, 1));
        deleteFiles(source_id);
    }
    useEffect(() => {
        getFiles();
    }, [])

    const getFiles = async () => {
        setIsLoading(true);
        const res = await fetch('/api/train/get_sources', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                brand_id,
            })
        })
        if (res.status == 200) {
            const files: AddedFiles[] = [];
            const data = await res.json();
            data.map((item: any) => {
                if (item.type == "files") {
                    files.push({
                        name: item.path,
                        progress: 100,
                        size: item.file_size,
                        state: "trained",
                        source: item
                    })
                }
            })
            setAddedFiles(files)
        }
        setIsLoading(false);
    }

    const deleteFiles = async (source_id: string) => {
        const res = await fetch('/api/train/delete_source_path', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: source_id,
            }),
        })
        if (res.status == 200) {

        } else {
            console.log(res);
        }
    }

    return (
        <Flex
            justify={'center'}
            mt={50}
            direction={'column'}
            align={'center'}

        >
            <Box
                style={{
                    boxShadow: "0px 0px 2px rgba(145, 158, 171, 0.24), 0px 20px 40px -4px rgba(145, 158, 171, 0.24)",
                    borderRadius: '15px'
                }}
                w={'100%'}
            >
                <Box
                    pb={15}
                    pt={15}
                    style={{
                        borderBottom: '1px solid #E5E7EB'
                    }}
                    pl={20}
                >
                    <Text weight={'bold'} size={'20px'}
                        className="headerline"
                    >
                        Upload Files
                    </Text>
                </Box>
                <Box p={15}>
                    <Box
                        pt={15} pb={15}
                    >
                        <Dropzone
                            accept={{
                                'image/*': [], // All images
                                'text/html': ['.html', '.htm', '.pdf', '.doc', '.docx', '.xls', '.csv', '.xlsx'],
                            }}
                            bg={'#F4F6F8'}
                            pt={30}
                            pb={30}
                            onDrop={(files) => {
                                trainFiles(files)
                            }}
                        // loading={isTrain}
                        >
                            <Flex
                                justify={'center'}
                                gap={5}
                                direction={'column'}
                                align={'center'}
                            >
                                <IconUpload color="#919EAB" />
                                <Text color="#919EAB" size={14}>
                                    Drag files here to upload
                                </Text>
                                <Text color="#18232A" size={13}
                                    weight={500}
                                    sx={(theme) => ({
                                        textDecoration: 'underline'
                                    })}
                                >
                                    or browse for files
                                </Text>
                            </Flex>
                        </Dropzone>
                    </Box>
                    <Flex
                        p={15}
                        gap={15}
                        direction={'column'}
                    >
                        {
                            addedFiles.map((item: AddedFiles, key) =>
                                <Flex
                                    key={key}
                                    justify={'flex-start'}
                                    
                                >
                                    <Flex gap={10} w={'1070px'} direction={'column'}>
                                        <Flex
                                            gap={10}
                                            align={'center'}
                                            w={'100%'}
                                        >
                                            <IconFile color="#9CA3AF" />
                                            <Flex align={'end'} justify={'space-between'} w={'100%'}>
                                                <Box>
                                                    <Text color="#18232A" size={14} weight={600}>
                                                        {item.name}
                                                    </Text>
                                                    <Text color="#9CA3AF" size={12}>
                                                        {item.size}M
                                                    </Text>
                                                </Box>
                                                {
                                                    item.state == "training" ?
                                                        <Text color="#9CA3AF" size={12}>
                                                            {item.progress}%
                                                        </Text> : <></>
                                                }

                                            </Flex>
                                        </Flex>
                                        {
                                            item.state == "training" ?
                                                <Progress value={item.progress} w={'100%'} color={THEME_COLOR} />
                                                : <></>
                                        }
                                    </Flex>
                                    <Box w={'30px'}>
                                        {
                                            item.state == "trained" ?
                                                <Flex
                                                    bg={THEME_COLOR}
                                                    sx={(theme) => ({
                                                        width: 16,
                                                        height: 16,
                                                        borderRadius: 16
                                                    })}
                                                    justify={'center'}
                                                    align={'center'}
                                                >
                                                    <IconCheck color="white" />
                                                </Flex> :
                                                <FaRegWindowClose
                                                    style={{ color: '#637381', cursor: 'pointer' }}
                                                    onClick={() => {
                                                        stopTraining(key);
                                                    }}
                                                />
                                        }
                                    </Box>
                                </Flex>
                            )
                        }
                    </Flex>
                    <Flex
                        justify={'space-between'}
                        w={'100%'}
                        pt={15}
                        mb={0}
                        sx={(theme) => ({
                            borderTop: '1px solid #E5E7EB'
                        })}
                    >
                        <Button variant="outline"
                            sx={(theme) => ({
                                borderColor: THEME_COLOR
                            })}
                            radius={30}
                            onClick={() => { prevStep() }}
                            className="transparent-button"
                        >
                            <Text color="black" className="body-normal">
                                Back
                            </Text>
                        </Button>

                        <Flex align={'center'}
                            gap={10}
                        >
                            <Link
                                href={`/${brand_name}/dashboard`}
                            >
                                <Text
                                    weight={600}
                                    size={14}
                                    color="#18232A"
                                    sx={(theme) => ({
                                        cursor: 'pointer'
                                    })}
                                    className="body-normal"
                                >
                                    Skip
                                </Text>
                            </Link>
                            <Link href={`/${brand_name}/dashboard`}>
                                <Button
                                    radius={30}
                                    bg={THEME_COLOR}
                                    sx={(theme) => ({
                                        '&:hover': {
                                            background: THEME_COLOR
                                        }
                                    })}
                                    pr={20}
                                    className="button-background"
                                >
                                    <Text color="black" size={14} className="body-normal">
                                        Continue
                                    </Text>
                                </Button>
                            </Link>
                        </Flex>
                    </Flex>
                </Box>
                <LoadingOverlay className="overloader" visible={isLoading}/>
            </Box>
        </Flex>
    )
}

export default FileBoard;