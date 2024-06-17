
// File: docs/chats/api.yaml

openapi: 3.0.0
info:
    title: Chat API
    version: 1.0.0
paths:
    /chats:
        get:
            summary: Retrieves a list of chats
            parameters:
                - name: userId
                  in: query
                  description: ID of the user whose chats to fetch
                  required: true
                  schema:
                      type: string
            responses:
                '200':
                    description: List of Chat objects returned successfully
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    status:
                                        type: boolean
                                    data:
                                        type: array
                '404':
                    description: No chats found
                    content:
                        application/json:
                            schema:
                                $ref: '#/components/schemas/Error'
        post:
            summary: Creates a new chat
            requestBody:
                required: true
                content:
                    multipart/form-data:
                        schema:
                            $ref: '#/components/schemas/IChat'
                    application/json:
                        schema:
                            $ref: '#/components/schemas/ICreateChatSpecs'
            responses:
                '200':
                    description: Chat object returned successfully
                    content:
                        application/json:
                            schema:
                                $ref: '#/components/schemas/IChat'
                '400':
                    description: Invalid request parameters
                    content:
                        application/json:
                            schema:
                                $ref: '#/components/schemas/Error'
        delete:
            summary: Delete all chats of a specific user
            parameters:
                - name: userId
                  in: query
                  description: User ID of the chats to delete
                  required: true
                  schema:
                      type: string
            responses:
                '200':
                    description: Chats deleted successfully
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    status:
                                        type: boolean
                                    data:
                                        type: object
                                        properties:
                                            deleted:
                                                type: array
                                                items:
                                                    type: string
                '400':
                    description: Invalid request parameters
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    status:
                                        type: boolean
                                    error:
                                        type: string
                '500':
                    description: Unexpected error
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    status:
                                        type: boolean
                                    error:
                                        type: string

    /chats/bulk:
        post:
            summary: Bulk create chats
            requestBody:
                required: true
                content:
                    multipart/form-data:
                        schema:
                            $ref: '#/components/schemas/BulkChat'
                    application/json:
                        schema:
                            $ref: '#/components/schemas/BulkChat'
            responses:
                '200':
                    description: List of Chat objects returned successfully
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    status:
                                        type: boolean
                                    data:
                                        type: array
                                        items:
                                            $ref: '#/components/schemas/IChat'

                '400':
                    description: Invalid request parameters
                    content:
                        application/json:
                            schema:
                                $ref: '#/components/schemas/Error'
    /chats/{id}:
        get:
            summary: Retrieves a chat based on a single ID
            parameters:
                - name: id
                  in: path
                  description: ID of the chat to fetch
                  required: true
                  schema:
                      type: string
            responses:
                '200':
                    description: Chat object returned successfully
                    content:
                        application/json:
                            schema:
                                $ref: '#/components/schemas/IChat'
                '400':
                    description: Invalid chat ID
                    content:
                        application/json:
                            schema:
                                $ref: '#/components/schemas/Error'
        put:
            summary: Updates a chat
            parameters:
                - name: id
                  in: path
                  description: ID of the chat to update
                  required: true
                  schema:
                      type: string
            requestBody:
                required: true
                content:
                    application/json:
                        schema:
                            $ref: '#/components/schemas/IChat'
                    multipart/form-data:
                        schema:
                            $ref: '#/components/schemas/IChat'
            responses:
                '200':
                    description: Chat object returned successfully
                    content:
                        application/json:
                            schema:
                                $ref: '#/components/schemas/IChat'
                '400':
                    description: Invalid request parameters
                    content:
                        application/json:
                            schema:
                                $ref: '#/components/schemas/Error'

        delete:
            summary: Delete a chat by ID or by user ID
            parameters:
                - name: id
                  in: path
                  description: ID of the chat to delete
                  required: true
                  schema:
                      type: string
                - name: userId
                  in: query
                  description: User ID of the chat to delete
                  required: false
                  schema:
                      type: string
            responses:
                '200':
                    description: Chat deleted successfully
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    status:
                                        type: boolean
                                    data:
                                        type: object
                                        properties:
                                            deleted:
                                                type: array
                                                items:
                                                    type: string
                '400':
                    description: Invalid request parameters
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    status:
                                        type: boolean
                                    error:
                                        type: string
                '500':
                    description: Unexpected error
                    content:
                        application/json:
                            schema:
                                type: object
                                properties:
                                    status:
                                        type: boolean
                                    error:
                                        type: string

components:
    schemas:
        IChat:
            type: object
            properties:
                id:
                    type: string
                name:
                    type: string
                usage:
                    type: string
                userId:
                    type: string
                parent:
                    type: string
                children:
                    type: string
                category:
                    type: string
                knowledgeBoxId:
                    type: string
                messages:
                    type: array
                    items:
                        type: object
                        additionalProperties: true
        ICreateChatSpecs:
            type: object
            properties:
                name:
                    type: string
                usage:
                    type: string
                userId:
                    type: string
                parent:
                    type: string
                children:
                    type: string
                category:
                    type: string
                knowledgeBoxId:
                    type: string
        BulkChat:
            type: object
            properties:
                chats:
                    type: array
                    items:
                        $ref: '#/components/schemas/IChat'
            required:
                - chats

        Error:
            type: object
            properties:
                status:
                    type: boolean
                error:
                    type: string


// File: docs/projects/api.yaml

openapi: 3.0.0
info:
    title: Chat-API Projects
    version: 1.0.0
    description: API endpoint for prompts in the Chat-API platform.
    contact:
        email: hello@aimpact.partners

paths:
    /projects:
        get:
            summary: Get a projects list.
            tags:
                - /projects
            responses:
                200:
                    description: Projects list geted successfully.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponseList'
                400:
                    description: Bad request. Possible errors regarding missing or incorrect data.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponseBadRequest'
        post:
            summary: Publish a new project.
            tags:
                - /projects
            requestBody:
                required: true
                content:
                    application/json:
                        schema:
                            type: object
                            required:
                                - name
                            properties:
                                id:
                                    type: string
                                name:
                                    type: string
                                description:
                                    type: string

            responses:
                200:
                    description: Project published successfully.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponse'
                400:
                    description: Bad request. Possible errors regarding missing or incorrect data.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponseBadRequest'

    /projects/{id}:
        get:
            summary: Get a Project.
            tags:
                - /projects
            responses:
                200:
                    description: Project Geted successfully.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponse'
                400:
                    description: Bad request. Possible errors regarding missing or incorrect data.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponseBadRequest'

        put:
            summary: Put a Project.
            tags:
                - /projects
            requestBody:
                required: true
                content:
                    application/json:
                        schema:
                            type: object
                            properties:
                                name:
                                    type: string
                                description:
                                    type: string
            responses:
                200:
                    description: Project updated successfully.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponse'
                400:
                    description: Bad request. Possible errors regarding missing or incorrect data.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponseBadRequest'

        delete:
            summary: Delete a Project.
            tags:
                - /projects
            requestBody:
                required: true
                content:
                    application/json:
                        schema:
                            type: object
                            required:
                                - id
                            properties:
                                id:
                                    type: string

            responses:
                200:
                    description: Project published successfully.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponse'
                400:
                    description: Bad request. Possible errors regarding missing or incorrect data.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponseBadRequest'

components:
    schemas:
        IResponse:
            type: object
            required:
                - status
            properties:
                status:
                    type: boolean
                    description: Response status.
                data:
                    type: object
                    $ref: '#/components/schemas/IProjectData'
                    description: Response Data.

        IResponseBadRequest:
            type: object
            properties:
                status:
                    type: boolean
                    description: Response status.
                error:
                    type: string
                    description: Error text.

        IResponseList:
            type: object
            required:
                - status
            properties:
                status:
                    type: boolean
                    description: Response status.
                data:
                    type: object
                    properties:
                        entries:
                            description: Response Data.
                            type: array
                            items:
                                $ref: '#/components/schemas/IProjectData'

        IProjectData:
            properties:
                id:
                    type: string
                name:
                    type: string
                identifier:
                    type: string
                description:
                    type: string


// File: docs/prompts/api.yaml

openapi: 3.0.0
info:
    title: Chat-API
    version: 1.0.0
    description: API endpoint for prompts in the Chat-API platform.
    contact:
        email: hello@aimpact.partners

paths:
    /prompts/templates:
        post:
            summary: Publish a new prompt.
            tags:
                - Prompts Templates
            requestBody:
                required: true
                content:
                    application/json:
                        schema:
                            allOf:
                                - $ref: '#/components/schemas/IPromptTemplateDataParams'
                                - type: object
                            required:
                                - name
                                - description
                                - language
                            properties:
                                categories:
                                    type: array
                                    items:
                                        type: string

            responses:
                200:
                    description: Prompt published successfully.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponse'
                400:
                    description: Bad request. Possible errors regarding missing or incorrect data.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponseBadRequest'

    /prompts/templates/{id}:
        get:
            summary: Get a Prompt.
            tags:
                - Prompts Templates
            description: id is composed by projectIdentifier.promptName (myProject.myPrompt)
            responses:
                200:
                    description: Prompt Geted successfully.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponse'
                400:
                    description: Bad request. Possible errors regarding missing or incorrect data.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponseBadRequest'

        put:
            summary: Update a Prompt.
            tags:
                - Prompts Templates
            responses:
                200:
                    description: Prompt Geted successfully.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponse'
                400:
                    description: Bad request. Possible errors regarding missing or incorrect data.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponseBadRequest'

        delete:
            summary: Delete a prompt.
            tags:
                - Prompts Templates
            requestBody:
                required: true
                content:
                    application/json:
                        schema:
                            type: object
                            required:
                                - value
                            properties:
                                value:
                                    type: string

            responses:
                200:
                    description: Prompt published successfully.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponse'
                400:
                    description: Bad request. Possible errors regarding missing or incorrect data.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponseBadRequest'

    /prompts/templates/project/{id}:
        get:
            summary: Get a prompts templates by project.
            tags:
                - Prompts Templates
            parameters:
                - name: is
                  in: query
                  description: Filter ('prompt', 'function', 'dependency').
                  schema:
                      type: string
                      enum:
                          - prompt
                          - function
                          - dependency
            responses:
                200:
                    description: Prompt Geted successfully.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponseList'
                400:
                    description: Bad request. Possible errors regarding missing or incorrect data.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponseBadRequest'

components:
    schemas:
        IResponse:
            type: object
            required:
                - status
            properties:
                status:
                    type: boolean
                    description: Response status.
                data:
                    type: object
                    $ref: '#/components/schemas/IPromptTemplateData'
                    description: Response Data.

        IResponseBadRequest:
            type: object
            properties:
                status:
                    type: boolean
                    description: Response status.
                error:
                    type: string
                    description: Error text.

        IResponseList:
            type: object
            required:
                - status
            properties:
                status:
                    type: boolean
                    description: Response status.
                data:
                    type: object
                    properties:
                        entries:
                            description: Response Data.
                            type: array
                            items:
                                $ref: '#/components/schemas/IPromptTemplateData'

        IPromptTemplateDataParams:
            allOf:
                - $ref: '#/components/schemas/IPromptTemplateBaseData'
                - type: object
            type: object
            required:
                - projectId
                - name
                - description
                - language
                - format
                - is
            properties:
                projectId:
                    type: string
                language:
                    type: object
                    properties:
                        default:
                            type: string
                        languages:
                            type: array
                            items:
                                type: string

        IPromptTemplateBaseData:
            allOf:
                - $ref: '#/components/schemas/IPromptTemplateData'
                - type: object
            type: object
            properties:
                options:
                    type: array
                    items:
                        $ref: '#/components/schemas/IPromptTemplateOptionData'

        IPromptTemplateData:
            type: object
            required:
                - id
                - name
                - description
                - language
                - format
                - is
            properties:
                id:
                    type: string
                name:
                    type: string
                identifier:
                    type: string
                description:
                    type: string
                language:
                    type: object
                    properties:
                        default:
                            type: string
                        languages:
                            type: array
                            items:
                                type: string
                format:
                    type: string
                    enum:
                        - json
                        - text
                is:
                    type: string
                    enum:
                        - prompt
                        - function
                        - dependency
                value:
                    type: string
                options:
                    type: array
                    items:
                        $ref: '#/components/schemas/IPromptTemplateOptionData'
                literals:
                    type: object
                    properties:
                        pure:
                            type: array
                            items:
                                type: string
                        dependencies:
                            type: array
                            items:
                                type: string
                        metadata:
                            type: array
                            items:
                                type: string
                project:
                    type: object
                    properties:
                        identifier:
                            type: string
                        name:
                            type: string
                        id:
                            type: string

        IPromptTemplateCategoryData:
            properties:
                id:
                    type: string
                name:
                    type: string
                description:
                    type: string
                prompts:
                    type: object
                    additionalProperties:
                        type: string

        IPromptTemplateOptionData:
            properties:
                id:
                    type: string
                value:
                    type: string


// File: docs/prompts/categories/api.yaml

openapi: 3.0.0
info:
    title: Chat-API
    version: 1.0.0
    description: API endpoint for prompts in the Chat-API platform.
    contact:
        email: hello@aimpact.partners

paths:
    /prompts/categories:
        post:
            summary: Publish a new prompt category.
            tags:
                - /prompts/categories
            requestBody:
                required: true
                content:
                    application/json:
                        schema:
                            type: object
                            required:
                                - name
                                - projectId
                            properties:
                                id:
                                    type: string
                                name:
                                    type: string
                                projectId:
                                    type: string
                                description:
                                    type: string
            responses:
                200:
                    description: Prompt Category published successfully.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponse'
                400:
                    description: Bad request. Possible errors regarding missing or incorrect data.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponse'

    /prompts/categories/{id}:
        get:
            summary: Get a Prompt.
            tags:
                - /prompts/categories
            responses:
                200:
                    description: Prompt Geted successfully.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponse'
                400:
                    description: Bad request. Possible errors regarding missing or incorrect data.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponseBadRequest'

        put:
            summary: Put a Prompt category.
            tags:
                - /prompts/categories
            requestBody:
                required: true
                content:
                    application/json:
                        schema:
                            type: object
                            properties:
                                name:
                                    type: string
                                description:
                                    type: string
            responses:
                200:
                    description: Prompt updated successfully.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponse'
                400:
                    description: Bad request. Possible errors regarding missing or incorrect data.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponseBadRequest'

        delete:
            summary: Delete a prompt category.
            tags:
                - /prompts/categories
            requestBody:
                required: true
                content:
                    application/json:
                        schema:
                            type: object
                            required:
                                - value
                            properties:
                                value:
                                    type: string
            responses:
                200:
                    description: Prompt published successfully.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponse'
                400:
                    description: Bad request. Possible errors regarding missing or incorrect data.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponseBadRequest'

    /prompts/categories/project/{id}:
        get:
            summary: Get list of Prompt Categories by Project.
            tags:
                - /prompts/categories
            responses:
                200:
                    description: Prompt Geted successfully.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponseList'
                400:
                    description: Bad request. Possible errors regarding missing or incorrect data.
                    content:
                        application/json:
                            schema:
                                type: object
                                $ref: '#/components/schemas/IResponseBadRequest'

components:
    schemas:
        IResponse:
            type: object
            required:
                - status
            properties:
                status:
                    type: boolean
                    description: Response status.
                data:
                    type: object
                    $ref: '#/components/schemas/IPromptCategoryData'
                    description: Response Data.

        IResponseBadRequest:
            type: object
            properties:
                status:
                    type: boolean
                    description: Response status.
                error:
                    type: string
                    description: Error text.

        IResponseList:
            type: object
            required:
                - status
            properties:
                status:
                    type: boolean
                    description: Response status.
                data:
                    type: object
                    properties:
                        entries:
                            description: Response Data.
                            type: array
                            items:
                                $ref: '#/components/schemas/IPromptCategoryData'

        IPromptCategoryData:
            properties:
                id:
                    type: string
                name:
                    type: string
                description:
                    type: string
                project:
                    type: object
                    properties:
                        id:
                            type: string
                        name:
                            type: string
                prompts:
                    type: object
                    additionalProperties:
                        type: string

